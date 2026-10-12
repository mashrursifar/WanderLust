const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {
    isAuthenticate,
    isOwner,
    validateListing,
    handleUpload,
} = require("../middlewares.js");
const listingController = require("../controllers/listingController.js");



router
    .route("/")
    .get(wrapAsync(listingController.index)) // Show all the Listings
    .post(
        // New Listing: form->data->add listing
        isAuthenticate,
        handleUpload,
        validateListing,
        wrapAsync(listingController.createNewListing),
    );

// createe new page: ->form
router
    .route("/new")
    .get(isAuthenticate, listingController.renderNewListingForm);

// Create new route: details view of a listing
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        // Edit in DB
        isAuthenticate,
        isOwner,
        handleUpload,
        validateListing,
        wrapAsync(listingController.updateListing),
    )
    .delete(
        // Destroy/delete from DB
        isAuthenticate,
        isOwner,
        wrapAsync(listingController.destroyListing),
    );
// Edit form
router
    .route("/:id/edit")
    .get(isAuthenticate, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
