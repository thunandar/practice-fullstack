const reviewsModel = require("../models/reviews.model");
const { reviewPopulate } = require("../config/populate");

exports.review = async (req, res) => {
  try {
    const review = new reviewsModel(req.body);
    await review.save();

    return res.send({
      status: 0,
      message: "Reviewed Successfully !",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { user_id, review_id, court_id, rate, message } = req.body;

    const review = await reviewsModel.findOneAndUpdate(
      { review_id: review_id, user_id: user_id, court_id: court_id },
      { rate: rate, message: message },
      { returnOriginal: false }
    );

    if (!review) {
      return res.send({
        status: 1,
        message: "Review Not Found!",
      });
    }

    return res.send({
      status: 0,
      message: "Review Updated Successfully!",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { review_id, user_id } = req.body;

    const deletedReview = await reviewsModel.findOneAndDelete({
      review_id: review_id,
      user_id: user_id,
    });

    if (!deletedReview) {
      return res.send({
        status: 1,
        message: "Review Not Found!",
      });
    }

    return res.send({
      status: 0,
      message: "Review Deleted Successfully !",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.reviewByCourt = async (req, res) => {
  try {
    const reviews = await reviewsModel.list(req.body)

    let transformData = [];

    const total_count = await reviewsModel
      .find({ court_id: req.body.court_id })
      .countDocuments();

    if (reviews.length > 0) {
      transformData = reviews.map((review) => review.transform(review));
    }

    return res.send({
      status: 0,
      data: transformData,
      total_count,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.reportReviewsByOwner = async (req, res) => {
  try {
    const { review_id, is_report } = req.body;

    const review = await reviewsModel.findOneAndUpdate(
      {
        review_id: review_id,
      },
      { is_report: is_report },
      { returnOriginal: false }
    );

    if(!review){
      return res.send({
        status: 1,
        message: "Review Not Found !",
      });
    }

    return res.send({
      status: 0,
      message: "Review Reported Successfully !",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.reportedReviewsListByAdmin = async (req, res) => {
  try {
    const { page, per_page, is_report } = req.body;
    
    const filter = {
      is_report: is_report,
    }

    const reportedReviewsList = await reviewsModel
      .find(filter)
      .populate(reviewPopulate)
      .skip(per_page * (page - 1))
      .limit(per_page)
      .sort({ updatedAt: -1 })
      .exec();

    let transformData = [];

    const total_count = await reviewsModel
      .find(filter)
      .countDocuments();

    if (reportedReviewsList.length > 0) {
      transformData = reportedReviewsList.map((review) =>
        review.transform(review)
      );
    }

    return res.send({
      status: 0,
      data: transformData,
      total_count,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};

exports.deleteReportedReviewsByAdmin = async (req, res) => {
  try {
    const { review_id } = req.body;

    const deletedReview = await reviewsModel.findOneAndDelete({
      review_id: review_id,
    });

    if (!deletedReview) {
      return res.send({
        status: 1,
        message: "Reported Review Not Found!",
      });
    }

    return res.send({
      status: 0,
      message: "Reported Review Deleted Successfully ! ",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error.message,
    });
  }
};
