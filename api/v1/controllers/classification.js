const Classification = require("../../../models/Classification");

module.exports = {
  /**
   * Create classification for admin
   * 0001A
   */
  createClassification: async (req, res) => {
    let checkCode = await Classification.find({
      type: req.body.type,
      code: req.body.code,
      deletedAt: "",
    }).exec();

    if (checkCode.length <= 0 || req.body.type === "classification") {
      new Classification({
        type: req.body.type,
        name: req.body.name,
        classification: req.body.classification,
        code: req.body.code,
      })
        .save()
        .then(classification => {
          return res.status(200).json({ success: true, info: classification });
        })
        .catch(e => {
          writeLog('classification', 'createClassification', '0001A', e.stack)
          return res.status(500).json({
            success: false,
            msg: "Failed to save a new Classification.",
          });
        });
    } else {
      return res.status(200).json({
        success: false,
        msg: "Code Already Exists.",
      });
    }
  },

  /**
   * Get all classification
   * 0001B
   */
  getAllClassification: async (req, res) => {
    try {
      let classifications = await Classification.find({ deletedAt: "" }).exec();
      return res.status(200).json({ success: true, info: classifications });
    } catch (e) {
      writeLog('classification', 'getAllClassification', '0001B', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of classifications.",
      });
    }
  },

  /**
   * Get One classification
   * 0001C
   */
  getClassification: async (req, res) => {
    try {
      let classification = await Classification.findOne({
        _id: req.params.id,
      }).exec();
      return res.status(200).json({ success: true, info: classification });
    } catch (e) {
      writeLog('classification', 'getClassification', '0001C', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the specific classification.",
      });
    }
  },

  /**
   * Get classifications by type
   * 0001D
   */
  getClassificationByType: async (req, res) => {
    try {
      let classification = await Classification.find({
        type: req.params.type,
        deletedAt: "",
      }).exec();
      return res.status(200).json({ success: true, info: classification });
    } catch (e) {
      writeLog('classification', 'getClassificationByType', '0001D', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the specific classification.",
      });
    }
  },

  /**
   * Update classification
   * 0001E
   */
  updateClassification: async (req, res) => {
    let checkCode = await Classification.find({
      type: req.body.type,
      code: req.body.code,
      deletedAt: "",
    }).exec();

    if (checkCode.length <= 0 || req.body.type === "classification") {
      try {
        let classification = await Classification.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
          }
        ).exec();
        return res.status(200).json({ success: true, info: classification });
      } catch (e) {
        writeLog('classification', 'updateClassification', '0001E', e.stack)
        return res.status(500).json({
          success: false,
          msg: "Failed to update the selected classification.",
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        msg: "Code Already Exists.",
      });
    }
  },

  /**
   * Delete classification
   * 0001F
   */
  deleteClassification: async (req, res) => {
    try {
      await Classification.findByIdAndUpdate(req.params.id, {
        deletedAt: new Date().toLocaleString(),
      }).exec();
      return res.status(200).json({ success: true, info: req.params.id });
    } catch (e) {
      writeLog('classification', 'deleteClassification', '0001F', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to delete the selected classification.",
      });
    }
  },
};
