const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");
const app = express();
const PORT = process.env.PORT || 5000;

const serviceAccount = require("./serviceAccountKey.json");

const sessionId = uuid.v4();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// const csrfMiddleware = csrf({ cookie: true });

app.engine("html", require("ejs").renderFile);
app.use(express.static("public"));

app.use(bodyParser.json());
app.use(cookieParser());
// app.use(csrfMiddleware);

// app.all("*", (req, res, next) => {
// res.cookie("XSRF-TOKEN", req.csrfToken());
//     next();
// });

app.get("/login", function(req, res) {
    res.render("login.html");
});

app.get("/signup", function(req, res) {
    res.render("signup.html");
});

app.get("/details", function(req, res) {
    res.render("details.html");
});

app.get("/dashboard", function(req, res) {
    res.render("dashboard.html");
});

app.get("/admin", function(req, res) {
    res.render("admin.html");
});

app.get("/profile", function(req, res) {
    const sessionCookie = req.cookies.session || "";

    admin
        .auth()
        .verifySessionCookie(sessionCookie, true /** checkRevoked */ )
        .then(() => {
            res.render("profile.html");
        })
        .catch((error) => {
            res.redirect("/login");
        });
});

app.get("/", function(req, res) {
    res.render("index.html");
});

app.post("/sessionLogin", (req, res) => {
    const idToken = req.body.idToken.toString();

    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    admin
        .auth()
        .createSessionCookie(idToken, { expiresIn })
        .then(
            (sessionCookie) => {
                const options = { maxAge: expiresIn, httpOnly: true };
                res.cookie("session", sessionCookie, options);
                res.end(JSON.stringify({ status: "success" }));
            },
            (error) => {
                res.status(401).send("UNAUTHORIZED REQUEST!");
            }
        );
});


app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(function(req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.post('/send-msg', (req, res) => {
    runSample(req.body.MSG).then(data => {
        res.send({ Reply: data })
        console.log(data);
    })
})


/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(msg, projectId = 'college-equiry-chatbot-yymp') {

    // Create a new session
    const sessionClient = new dialogflow.SessionsClient({
        keyFilename: "C:/Users/Admin/college-enquiry-chatbot/college-equiry-chatbot-yymp-ebee6ab325a0.json"
    });
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: msg,
                // The language used by the client (en-US)
                languageCode: 'en-US',
            },
        },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log('  No intent matched.');
    }
    return result.fulfillmentText;
}

app.get("/sessionLogout", (req, res) => {
    res.clearCookie("session");
    res.redirect("/login");
});


// chatbot started
app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(function(req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.post('/send-msg', (req, res) => {
    runSample(req.body.MSG).then(data => {
        res.post({ Reply: data })
    })
})

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(msg, projectId = 'college-equiry-chatbot-yymp') {

    // Create a new session
    const sessionClient = new dialogflow.SessionsClient({
        keyFilename: "./college-equiry-chatbot-yymp-ebee6ab325a0.json"
    });
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: msg,
                // The language used by the client (en-US)
                languageCode: 'en-US',
            },
        },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log('  No intent matched.');
    }
    return result.fulfillmentText;
}

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});