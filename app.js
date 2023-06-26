const fs = require("fs");
const express = require("express");
const mysql = require("mysql2");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const moment = require("moment");
const multer = require("multer");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

const app = express();
const port = 3000;

//buat folder penampung file jika tidak ada
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// middleware untuk parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.set("views", path.join(__dirname, "/views"));

app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/img", express.static(path.resolve(__dirname, "assets/img")));

// template engine
app.set("view engine", "ejs");

// layout ejs
app.use(expressLayouts);

// mengatur folder views
app.set("views", "./views");
// Middleware session
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware flash messages
app.use(flash());

//create the connection to database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "tb_pweb_a",
});

//database connection
db.connect((err) => {
  if (err) throw err;
  console.log("database connected..");
});

const saltRounds = 10;

//=============================================================================================================//

//register
app.get("/register", function (req, res) {
  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = "";
  const successMessage = req.session.successMessage;
  req.session.successMessage = "";
  res.render("register", {
    title: "Register",
    layout: "layouts/auth-layout",
    errorMessage: errorMessage,
    successMessage: successMessage,
  });
});

app.post("/register", function (req, res) {
  const { username, email, password, confirm_password } = req.body;

  // check if username already exists
  const sqlCheck = "SELECT * FROM users WHERE username = ?";
  db.query(sqlCheck, username, (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      console.error({ message: "Username sudah terdaftar", err });
      req.session.errorMessage = "Username sudah terdaftar";
      return res.redirect("/register");
    }

    if (password !== confirm_password) {
      console.error({ message: "Password tidak cocok!", err });
      req.session.errorMessage = "Password tidak cocok!";
      return res.redirect("/register");
    }

    // hash password
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) throw err;

      // insert user to database
      const sqlInsert =
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
      const values = [username, email, hash];
      db.query(sqlInsert, values, (err, result) => {
        if (err) throw err;
        console.log({ message: "Registrasi berhasil", values });
        res.redirect("/login");
      });
    });
  });
});

// login page
app.get("/login", function (req, res) {
  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = "";
  const successMessage = req.session.successMessage;
  req.session.successMessage = "";
  res.render("login", {
    title: "Login",
    layout: "layouts/auth-layout",
    errorMessage: errorMessage,
    successMessage: successMessage,
  });
});

app.post("/login", function (req, res) {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], function (err, result) {
    if (err) {
      console.error({ message: "Internal Server Error", err });
      req.session.errorMessage = "Internal Server Error";
      return res.redirect("/login");
    }

    if (result.length === 0) {
      console.error({ message: "Username atau Password salah!!", err });
      req.session.errorMessage = "Username atau Password salah!!";
      return res.redirect("/login");
    }

    const user = result[0];

    // compare password
    bcrypt.compare(password, user.password, function (err, isValid) {
      if (err) {
        console.error({ message: "Internal Server Error", err });
        req.session.errorMessage = "Internal Server Error";
        return res.redirect("/login");
      }

      if (!isValid) {
        console.error({ message: "Username atau Password salah!!", err });
        req.session.errorMessage = "Username atau Password salah!!";
        return res.redirect("/login");
      }

      // generate token
      const token = jwt.sign({ user_id: user.user_id }, "secret_key");
      res.cookie("token", token, { httpOnly: true });

      console.log({ message: "Login Berhasil", user });
      return res.redirect("/");
    });
  });
});

// logout
app.get("/logout", function (req, res) {
  res.clearCookie("token");
  res.redirect("/login");
});

// middleware untuk memeriksa apakah user sudah login
function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    res.redirect("/login");
    return;
  }

  jwt.verify(token, "secret_key", function (err, decoded) {
    if (err) {
      res.redirect("/login");
      return;
    }

    req.user_id = decoded.user_id;
    next();
  });
}

//index page
app.get("/", requireAuth, function (req, res) {
  if (!req.user_id) {
    res.redirect("/login");
    return;
  }

  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = ""; // Clear the error message from session
  const successMessage = req.session.successMessage;
  req.session.successMessage = "";

  const user_id = req.user_id;

  const selectSql = `SELECT forms.*
  FROM forms
  WHERE forms.user_id = ${user_id}`;

  db.query(selectSql, (err, result) => {
    if (err) {
      throw err;
    }
    res.render("index", {
      forms: result,
      moment: moment,
      title: "Home",
      layout: "layouts/main-layout",
      errorMessage: errorMessage,
      successMessage: successMessage,
    });
  });
});

// get add-form page
app.get("/add-form", function (req, res) {
  res.render("add-form", {
    title: "add form",
    layout: "layouts/main-layout",
  });
});

//post add form
app.post("/add-form", requireAuth, function (req, res) {
  const user_id = req.user_id;
  const title = req.body.title;
  const description = req.body.description;

  const sql =
    "INSERT INTO forms (user_id, title, description) VALUES (?, ?, ?)";
  const values = [user_id, title, description];
  db.query(sql, values, (err, result) => {
    if (err) {
      throw err;
    }
    console.log({ message: "Form berhasil dibuat", values });
    req.session.successMessage = "Form berhasil dibuat";
    res.redirect("/");
  });
});

// get detail form
app.get("/detail-form/:form_id", requireAuth, function (req, res) {
  const user_id = req.user_id;
  const form_id = req.params.form_id;

  // check if user is the creator of the form
  const formSql = "SELECT * FROM forms WHERE form_id = ?";
  db.query(formSql, [form_id], function (err, formResult) {
    if (err) throw err;

    const formCreator = formResult[0].user_id;
    if (user_id === formCreator) {
      res.send("You cannot submit your own form");
    }

    // check if user has submitted the form
    const submissionSql =
      "SELECT * FROM submissions WHERE form_id = ? AND user_id = ?";
    db.query(
      submissionSql,
      [form_id, user_id],
      function (err, submissionResult) {
        if (err) throw err;
        let isSubmitted = false;
        let submission = null;
        if (submissionResult.length > 0) {
          isSubmitted = true;
          submission = submissionResult[0];
        }

        res.render("detail-form", {
          user: user_id,
          form: formResult[0],
          moment: moment,
          title: "Detail form",
          layout: "layouts/main-layout",
          isSubmitted: isSubmitted,
          submission: submission,
        });
      }
    );
  });
});

//download file pada detail form
app.get("/download/:user_id/:form_id", requireAuth, (req, res) => {
  const user_id = req.params.user_id;
  const form_id = parseInt(req.params.form_id);

  // Check if user has access to the form
  const formSql = "SELECT * FROM forms WHERE form_id = ? AND user_id = ?";
  db.query(formSql, [form_id, user_id], function (err, formResult) {
    if (err) {
      throw err;
    }
    if (formResult.length === 0) {
      return res.status(404).send("Form not found");
    }

    // Check if submission exists
    const submissionSql =
      "SELECT * FROM submissions WHERE user_id = ? AND form_id = ?";
    db.query(
      submissionSql,
      [user_id, form_id],
      function (err, submissionResult) {
        if (err) {
          throw err;
        }
        if (submissionResult.length === 0) {
          return res.status(404).send("Submission not found");
        }

        const submission = submissionResult[0];
        const filePath = `uploads/${submission.uploaded_file}`;

        res.download(filePath, submission.file_name, function (err) {
          if (err) {
            console.log(err);
            res.status(500).send("Internal server error");
          }
        });
      }
    );
  });
});

// Create multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

// Create multer upload configuration
const upload = multer({ storage: storage });

// Handle file upload
app.post("/upload", upload.single("uploaded_file"), requireAuth, (req, res) => {
  const user_id = req.user_id;
  const form_id = req.body.form_id;
  const description = req.body.description;
  const uploaded_file = req.file.filename;

  // Check if user has already submitted for the form
  const submissionSql =
    "SELECT * FROM submissions WHERE user_id = ? AND form_id = ?";
  const submissionValues = [user_id, form_id];
  db.query(submissionSql, submissionValues, (err, submissionResult) => {
    if (err) {
      throw err;
    }

    // Insert data to MySQL
    const insertSql =
      "INSERT INTO submissions (user_id, form_id, uploaded_file, description) VALUES (?, ?, ?, ?)";
    const insertValues = [user_id, form_id, uploaded_file, description];
    db.query(insertSql, insertValues, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("Data inserted to MySQL!");
      res.redirect("/");
    });
  });
});

// get profil page
app.get("/profil", requireAuth, function (req, res) {
  const user_id = req.user_id;
  const selectSql = "SELECT * FROM users WHERE user_id = ?";
  db.query(selectSql, [user_id], (err, result) => {
    if (err) {
      throw err;
    }
    // Periksa apakah user sudah login dan aktif
    if (result.length > 0 && result[0].active === 0) {
      res.render("profil", {
        user: result[0],
        title: "Profil",
        layout: "layouts/main-layout",
      });
    } else {
      // Jika user tidak aktif atau data tidak ditemukan, arahkan kembali ke halaman login
      res.redirect("/login");
    }
  });
});

//post edit profil
app.post("/edit-profil", upload.single("avatar"), requireAuth, (req, res) => {
  const user_id = req.user_id;
  const avatar = req.file.filename;

  // Insert data ke MySQL
  const updateUserSql = "UPDATE users SET avatar = ? WHERE user_id = ?";
  const values = [avatar, user_id];
  db.query(updateUserSql, values, (err, result) => {
    if (err) {
      throw err;
    }
    console.log("Data inserted to MySQL!");

    // Copy file ke img directory
    const source = path.join(__dirname, "uploads", avatar);
    const destination = path.join(__dirname, "assets", "img", avatar);
    fs.copyFileSync(source, destination);

    res.redirect("/profil");
  });
});

// get Edit user page
app.get("/edit-profil", requireAuth, function (req, res) {
  const user_id = req.user_id;
  const selectSql = "SELECT * FROM users WHERE user_id = ?";
  db.query(selectSql, [user_id], (err, result) => {
    if (err) {
      throw err;
    }
    res.render("edit-profil", {
      user: result[0],
      title: "Edit Profil",
      layout: "layouts/main-layout",
    });
  });
});

//post ganti password
app.post("/ganti-password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user_id;

  // Check if current password matches with database
  const sql = "SELECT password FROM users WHERE user_id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.log({ message: "Internal Server Error", err });
      res.status(500).send("Internal Server Error");
      return;
    }

    const hashedPassword = result[0].password;
    bcrypt.compare(currentPassword, hashedPassword, (error, isMatch) => {
      if (error) {
        console.log({ message: "Internal Server Error", error });
        res.status(500).send("Internal Server Error");
        return;
      }

      if (isMatch) {
        // If current password matches, hash new password and update database
        bcrypt.hash(newPassword, saltRounds, (err, hashedNewPassword) => {
          if (err) {
            console.log({ message: "Internal Server Error", err });
            res.status(500).send("Internal Server Error");
            return;
          }

          const updateSql = "UPDATE users SET password = ? WHERE user_id = ?";
          const values = [hashedNewPassword, userId];
          db.query(updateSql, values, (err, result) => {
            if (err) {
              console.log({ message: "Internal Server Error", err });
              res.status(500).send("Internal Server Error");
              return;
            }
            console.log({ message: "Password berhasil diubah", values });
            res.redirect("/");
          });
        });
      } else {
        // If current password doesn't match, send error message
        console.log({ message: "Invalid current password" });
        res.redirect("/profil");
      }
    });
  });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
