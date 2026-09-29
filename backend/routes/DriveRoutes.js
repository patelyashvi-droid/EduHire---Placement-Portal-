const express = require("express");
const router = express.Router();

const Drive = require("../models/drives");


// ======================================
// CALCULATE DRIVE STATUS
// ======================================

const calculateDriveStatus = (driveDate) => {

  if (!driveDate) {
    return "Scheduled";
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);


  // Convert YYYY-MM-DD into Date
  const [year, month, day] = driveDate
    .split("-")
    .map(Number);

  const drive = new Date(
    year,
    month - 1,
    day
  );

  drive.setHours(0, 0, 0, 0);


  // Difference
  const difference =
    drive.getTime() - today.getTime();


  const differenceInDays =
    difference / (1000 * 60 * 60 * 24);


  // Already passed
  if (differenceInDays < 0) {
    return "Completed";
  }


  // Today to next 10 days
  if (differenceInDays <= 10) {
    return "Upcoming";
  }


  // More than 10 days
  return "Scheduled";
};



// ======================================
// ADD NEW DRIVE
// ======================================

router.post("/add", async (req, res) => {

  try {

    const {
      company,
      role,
      description,
      eligibility_criteria,
      package: packageAmount,
      drive_date,
      last_date,
      location
    } = req.body;


    // Validation

    if (
      !company ||
      !role ||
      !description ||
      !eligibility_criteria ||
      !packageAmount ||
      !drive_date ||
      !last_date ||
      !location
    ) {

      return res.status(400).json({
        message: "Please fill all required fields"
      });

    }


    // Calculate initial status

    const status =
      calculateDriveStatus(drive_date);


    // Create drive

    const drive = new Drive({

      company,

      role,

      description,

      eligibility_criteria,

      package: packageAmount,

      drive_date,

      last_date,

      location,

      driveStatus : "Scheduled",

      applicants: 0

    });


    // Save to MongoDB

    await drive.save();


    res.status(201).json({

      message: "Placement drive scheduled successfully",

      drive

    });


  } catch (error) {

    console.error(
      "ADD DRIVE ERROR:",
      error
    );


    res.status(500).json({

      message: "Unable to schedule drive"

    });

  }

});



// ======================================
// GET ALL DRIVES
// ======================================

router.get("/", async (req, res) => {

  try {

    const drives = await Drive
      .find()
      .sort({ createdAt: -1 });


    // ==================================
    // UPDATE STATUS IN DATABASE
    // ==================================

    for (const drive of drives) {

      const newStatus =
        calculateDriveStatus(
          drive.drive_date
        );


      // Only update if status changed

      if (drive.driveStatus !== newStatus) {

        drive.driveStatus = newStatus;

        await drive.save();

      }

    }


    // Return updated drives

    res.status(200).json(drives);


  } catch (error) {

    console.error(
      "GET DRIVES ERROR:",
      error
    );


    res.status(500).json({

      message: "Unable to fetch drives"

    });

  }

});



// ======================================
// GET SINGLE DRIVE
// ======================================

router.get("/:id", async (req, res) => {

  try {

    const drive = await Drive.findById(
      req.params.id
    );


    if (!drive) {

      return res.status(404).json({

        message: "Drive not found"

      });

    }


    // Update status

    const newStatus =
      calculateDriveStatus(
        drive.drive_date
      );


    if (drive.driveStatus !== newStatus) {

      drive.driveStatus = newStatus;

      await drive.save();

    }


    res.status(200).json(drive);


  } catch (error) {

    console.error(
      "GET DRIVE ERROR:",
      error
    );


    res.status(500).json({

      message: "Unable to fetch drive"

    });

  }

});



// ======================================
// DELETE DRIVE
// ======================================

router.delete("/:id", async (req, res) => {

  try {

    const drive =
      await Drive.findByIdAndDelete(
        req.params.id
      );


    if (!drive) {

      return res.status(404).json({

        message: "Drive not found"

      });

    }


    res.status(200).json({

      message: "Drive deleted successfully"

    });


  } catch (error) {

    console.error(
      "DELETE DRIVE ERROR:",
      error
    );


    res.status(500).json({

      message: "Unable to delete drive"

    });

  }

});


module.exports = router;