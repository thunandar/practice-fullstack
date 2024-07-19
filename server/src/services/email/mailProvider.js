const Email = require("email-templates");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const { mail, env } = require("../../config/vars");
const email_icon = mail.vector_url;

const transporter = nodemailer.createTransport({
  port: mail.port,
  host: mail.host,
  auth: {
    user: mail.username,
    pass: mail.password,
  },
  // secureConnection: true,
  logger: true,
  // tls: {
  //   secure: false,
  //   ignoreTLS: true,
  //   rejectUnauthorized: false
  // },
  service: "gmail",
  secure: true,
});

const handlerOption = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve("./src/services/email/views"),
    defaultLayout: false,
  },
  viewPath: path.resolve("./src/services/email/views"),
  extName: ".handlebars",
};

transporter.use("compile", hbs(handlerOption));

transporter.verify((error) => {
  if (error) {
    console.log("error with email connection");
  }
});

exports.sendResetCodeMail = async (user) => {
  const email = {
    from: mail.username,
    to: user.email,
    subject: "Reset Verify Code From Sports Empire",
    template: "reset_password",
    context: {
      name: user.name,
      code: user.code,
    },
  };

  mailTransporter(email);
};

exports.ownerEmailVerify = async (user) => {
  const email = {
    from: mail.username,
    to: user.email,
    subject: "Please Verify Owner Email at Sports Empire",
    template: "owner_verify_email",
    context: {
      name: user.name,
      code: user.code,
    },
  };

  mailTransporter(email);
};

exports.sendOwnerApprovedMail = async (user) => {
  const email = {
    from: mail.username,
    to: user.email,
    subject: user.subject,
    template: "owner_approved",
    context: {
      name: user.name,
      password: user?.password,
      message: user.message,
    },
  };

  mailTransporter(email);
};

exports.sendOwnerMail = async (user) => {
  const email = {
    from: mail.username,
    to: user.email,
    subject: user.subject,
    template: "owner_status",
    context: {
      name: user.name,
      message: user.message,
    },
  };

  mailTransporter(email);
};

exports.sendPlanOrderMail = async (user) => {
  const email = {
    from: mail.username,
    to: user.email,
    subject: "Plan Approval Notification",
    template: "plan_order_invoice",
    context: {
      name: user.name,
      email: user.email,
      order_id: user.order_id,
      plan: user.plan,
      message: user.message,
      total_cost: user.total_cost,
      invoice_date: user.invoice_date,
      status: user.status,
    },
  };

  mailTransporter(email);
};

exports.sendPlanOrderVerifyMail = async (user) => {
  const email = {
    from: mail.username,
    to: user.email,
    subject: user.subject,
    template:
      user.status === "Approved"
        ? "plan_order_verify_invoice"
        : "plan_order_invoice",
    context: {
      name: user.name,
      email: user.email,
      order_id: user.order_id,
      plan: user.plan,
      message: user.message,
      total_cost: user.total_cost,
      invoice_date: user.invoice_date,
      status: user.status,
    },
  };

  mailTransporter(email);
};

exports.sendPlanOrderNotiBeforeExpireMail = async (user) => {
  const email = {
    from: mail.username,
    to: user.email,
    subject:  user.status === "Expired"
    ? "Your Order is Expired"
    : "Your Order is Expiring Soon",
    template:
      user.status === "Expired"
        ? "plan_order_noti_expired"
        : "plan_order_noti_before_expire",
    context: {
      name: user.name,
      email: user.email,
      order_id: user.order_id,
      plan: user.plan,
      message: user.message,
      total_cost: user.total_cost,
    },
  };

  mailTransporter(email);
};

exports.sendSubscriptionAccountMail = async (user) => {
  const email = {
    from: mail.username,
    to: user.email,
    subject: "Subscription Approval Notification",
    template: "subscribe_account_invoice",
    context: {
      name: user.name,
      email: user.email,
      subscription_id: user.subscription_id,
      message: user.message,
      total_cost: user.subscription.price,
      invoice_date: user.invoice_date,
      status: user.status,
    },
  };

  mailTransporter(email);
};

async function mailTransporter(email) {
  // if(env != "production") {
  //   console.log("Email Test Send...");
  //   return;
  // }

  transporter.sendMail(email, (error, info) => {
    if (error) {
      logger.warn(error);
    } else {
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  });
}
