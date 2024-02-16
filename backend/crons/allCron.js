const moment = require("moment");
const ExcelJS = require('exceljs');
const fs = require('fs');
const { Suite, Program, ProgramSubmission } = require("../models");
const { sendMail } = require("../utils/mailer");

exports.runJob = async (event, context, callback) => {
  try {
    await this.runFunction("reminderKPIDetailEmailCron");
    if (callback) {
      callback(null, {
        statusCode: 200,
        body: 'CRON successfully ran!!'
      })
    }
  } catch (e) {
    console.log('EMAIL CRON ERROR', e.message);
    if (callback) {
      callback(null, {
        statusCode: 500,
        body: 'ERROR RUNNING CRON'
      })
    }
  }
}

exports.runFunction = async (functionName, urgent = false) => {
  switch (functionName) {
    case 'reminderKPIDetailEmailCron':
      await reminderKPIDetailEmailCron();
      break;
  }
}

async function reminderKPIDetailEmailCron() {
  console.log('REMINDER KPI EMAIL CRON STARTED')
  const suites = await Suite.find({ reminderType: { $exists: true, $ne: '' }}).populate('user_id');

  for (let i = 0; i < suites.length; i++) {
    if (!suites[i].nextReminderDate) {
      await Suite.findByIdAndUpdate(suites[i]._id, { $set: { nextReminderDate: suites[i].createdAt }}, {lean: true, upsert: true});
      suites[i].nextReminderDate = suites[i].createdAt;
    } else {
      const start = moment(suites[i].nextReminderDate);

      switch (suites[i].reminderType) {
        case 'weekly':
          const isWeeklyOverdue = moment().diff(start, 'weeks') >= 1;
          if (isWeeklyOverdue) {
            const submissionData = await getSubmissionData(suites[i]._id, suites[i].nextReminderDate);
            if (submissionData.length > 0) {
              const filePath = await createExcelFile(submissionData);

              const mailOptions = {
                subject: 'Submission Data Report',
                to: suites[i].user_id.email,
                message: await reminderMailContent(suites[i].user_id),
                attachments: [
                  {
                    content: 'base64-encoded-file-content',
                    filename: filePath,
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    disposition: 'attachment',
                  },
                ],
              };

              // Send email with Excel file as an attachment
              mailOptions.attachments[0].content = fs.readFileSync(filePath, { encoding: 'base64' });
              await sendMail(mailOptions);

              const nextWeekDate = moment().add(1, 'weeks');
              await Suite.findByIdAndUpdate(suites[i]._id, { $set: { nextReminderDate: nextWeekDate.toDate() } }, {lean: true, upsert: true});
            }
          }
          break;
        case 'monthly':
          const isMonthlyOverdue = moment().diff(start, 'months') >= 1;
          if (isMonthlyOverdue) {
            const submissionData = await getSubmissionData(suites[i]._id, suites[i].nextReminderDate);

            if (submissionData.length > 0) {
              const filePath = await createExcelFile(submissionData);
              const mailOptions = {
                subject: 'Submission Data Report',
                to: suites[i].user_id.email,
                message: await reminderMailContent(suites[i].user_id),
                attachments: [
                  {
                    content: 'base64-encoded-file-content',
                    filename: filePath,
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    disposition: 'attachment',
                  },
                ],
              };

              // Send email with Excel file as an attachment
              mailOptions.attachments[0].content = fs.readFileSync(filePath, { encoding: 'base64' });
              await sendMail(mailOptions);

              const nextMonthDate = moment(suites[i].nextReminderDate).add(1, 'months').date(1);
              // Update reminder date
              await Suite.findByIdAndUpdate(suites[i]._id, { $set: { nextReminderDate: nextMonthDate.toDate() } }, {lean: true, upsert: true});
            }
          }
          break;
        case 'quarterly':
          const isQuarterlyOverdue = moment().diff(start, 'months') >= 6;

          if (isQuarterlyOverdue) {
            const submissionData = await getSubmissionData(suites[i]._id, suites[i].nextReminderDate);

            if (submissionData.length > 0) {
              const filePath = await createExcelFile(submissionData);
              const mailOptions = {
                subject: 'Submission Data Report',
                to: suites[i].user_id.email,
                message: await reminderMailContent(suites[i].user_id),
                attachments: [
                  {
                    content: 'base64-encoded-file-content',
                    filename: filePath,
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    disposition: 'attachment',
                  },
                ],
              };

              // Send email with Excel file as an attachment
              mailOptions.attachments[0].content = fs.readFileSync(filePath, { encoding: 'base64' });
              await sendMail(mailOptions);

              const nextQuarterDate = moment(suites[i].nextReminderDate).add(6, 'months').date(1);
              // Update reminder date
              await Suite.findByIdAndUpdate(suites[i]._id, { $set: { nextReminderDate: nextQuarterDate.toDate() } }, {lean: true, upsert: true});
            }
          }
          break;
        case 'annually':
          const isAnnuallyOverdue = moment().diff(start, 'years') >= 1;
          if (isAnnuallyOverdue) {
            const submissionData = await getSubmissionData(suites[i]._id, suites[i].nextReminderDate);

            if (submissionData.length > 0) {
              const filePath = await createExcelFile(submissionData);
              const mailOptions = {
                subject: 'Submission Data Report',
                to: suites[i].user_id.email,
                message: await reminderMailContent(suites[i].user_id),
                attachments: [
                  {
                    content: 'base64-encoded-file-content',
                    filename: filePath,
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    disposition: 'attachment',
                  },
                ],
              };

              // Send email with Excel file as an attachment
              mailOptions.attachments[0].content = fs.readFileSync(filePath, { encoding: 'base64' });
              await sendMail(mailOptions);
              const nextAnnualDate = moment(suites[i].nextReminderDate).add(1, 'year').date(1);
              // Update reminder date
              await Suite.findByIdAndUpdate(suites[i]._id, { $set: { nextReminderDate: nextAnnualDate.toDate() } }, {lean: true, upsert: true});
            }
          }
          break;
      }
    }
  }
  console.log('REMINDER KPI EMAIL CRON COMPLETED')
}

async function reminderMailContent(user) {
  return `Dear ${user.firstName + ' ' + user.lastName},\n
  Your KPIs submission data report is ready for you. Please check the attached submission file.\n
  If you did not get attached excel file, please contact our support team immediately.\n
  Thank you for choosing Alleviate!`;
}

async function createExcelFile(submissionData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Submission Data');
  worksheet.addRow(['Name', 'Email', 'Status', 'Date']);

  submissionData.forEach((data) => {
    worksheet.addRow([data.name, data.email, data.status, data.date]);
  });

  const filePath = 'files/submissionData.xlsx';
  await workbook.xlsx.writeFile(filePath);

  return filePath;
}


async function getSubmissionData(suiteId, nextReminderDate) {
  const assessments = await Program.find({ suite: suiteId })
  const submissionData = [];
  if (assessments.length > 0) {
    const baseQuery = {
      programId: { $in: assessments.map((a) => a._id) },
      createdAt: {
        $lte: moment().toDate(),
        $gte: nextReminderDate,
      },
    };

    const submissions = await ProgramSubmission.find({ ...baseQuery }).populate('user_id');
    submissionData.push(
        ...submissions.map((submission) => ({
          name: `${submission.user_id.firstName} ${submission.user_id.lastName}`,
          email: submission.user_id.email,
          status: submission.formData.isFinishClicked ? 'Submitted' : 'Pending',
          date: submission.createdAt,
        }))
    );
  }

  return submissionData;
}
