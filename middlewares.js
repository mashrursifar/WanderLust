const Listing = require("./models/listing");
const Review = require("./models/review");
const { schema } = require("./schemaValidation");
const { reviewValidation } = require("./reviewValidation.js");
const { userValidation } = require("./userValidation.js");
const { upload } = require("./cloudConfig.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isAuthenticate = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // console.log(req.method);
        req.session.redirectUrl =
            req.method == "GET" ? req.originalUrl : req.headers.referer;
        req.flash("err", "You need to login first");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(req.user._id)) {
        req.flash(
            "err",
            "It looks like you don't have access to this listing.",
        );
        return res.redirect(`/listing/${id}`);
    }
    next();
};

module.exports.isAuthor = async (req, res, next) => {
    let { id, idR } = req.params;

    const review = await Review.findById(idR);

    if (!review.author.equals(req.user._id)) {
        req.flash(
            "err",
            "It looks like you don't have access to delete this review.",
        );
        return res.redirect(`/listing/${id}`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
        throw new ExpressError(400, error.message);
    } else {
        req.body = value;
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error, value } = reviewValidation.validate(req.body);

    if (error) {
        throw new ExpressError(400, error.message);
    } else {
        req.body = value;
        next();
    }
};

module.exports.userValidate = (req, res, next) => {
    const { error, value } = userValidation.validate(req.body);

    if (error) {
        throw new ExpressError(400, error.message);
    } else {
        req.body = value;
        next();
    }
};

module.exports.handleUpload = (req, res, next) => {
    upload.single("image.url")(req, res, (err) => {
        if (err) {
            
            if (err.code === "LIMIT_FILE_SIZE") {
                err.message = "File size must be less than 10 MB.";
            } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
                err.message = "Unexpected file field or too many files.";
            } else if (err.message === "INVALID_FILE_TYPE") {
                err.message = "Only JPG, JPEG, and PNG files are allowed.";
            }

            return next(err);
        }

        next();
    });
};
