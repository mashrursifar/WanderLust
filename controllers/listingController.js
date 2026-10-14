const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");
const mbxGeocode = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocode({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const {search} = req.query;
    
    const allListings= search?await Listing.find({location:search}):await Listing.find({});

    res.render("listing/listing.ejs", { allListings });
};

module.exports.renderNewListingForm = (req, res) => {
    res.render("listing/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({ path: "review", populate: { path: "author" } })
        .populate("owner");
    // console.log(listing);

    if (!listing) {
        req.flash("err", "Listing you have requested, does not exists!!");

        return res.redirect("/listing");
        // throw new ExpressError(404, "Listing Not Found");
    }

    res.render("listing/show.ejs", {
        listing,
        username: listing.owner.username,
    });
};

module.exports.createNewListing = async (req, res) => {
    let filename = req.file.filename;
    let url = req.file.path;
    let location = req.body.location + ", " + req.body.country;

    let response = await geocodingClient
        .forwardGeocode({
            query: location,
            limit: 1,
        })
        .send();

    const newListing = {
        ...req.body,
        owner: req.user._id,
        image: { filename, url },
        geometry: response.body.features[0].geometry,
    };
    // console.log(newListing);
    const list = new Listing(newListing);
    // console.log(list);
    await list.save();
    req.flash("success", "New listing created!!");
    res.redirect("/listing");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findById(id);
    // Use it when using curdinary url to replace image. we are using inline css in the edit.ejs
    // let imageUrl = listing.image.url
    // imageUrl = imageUrl.replace("/upload", "/upload/h_200,w_350")
    res.render("listing/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = req.body;
    let location = listing.location + "," + listing.country;
    let response = await geocodingClient
        .forwardGeocode({
            query: location,
            limit: 1,
        })
        .send();
    listing.geometry = response.body.features[0].geometry;
    // console.log(id);

    console.log("Listing in the update route edit", listing);
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { filename, url };
    }

    const newListing = await Listing.findByIdAndUpdate(id, listing);
    // console.log(newListing);
    // await newListing.save();

    req.flash("success", "Listing edited successfully!!");
    res.redirect(`/listing/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    let delData = await Listing.findByIdAndDelete(id);

    if (!delData) {
        throw new ExpressError(404, "Listing Not Found");
    }
    req.flash("success", "Listing Deleted!!");
    console.log(delData);
    res.redirect("/listing");
};
