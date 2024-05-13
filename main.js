const express = require("express");
const app = express();
const port = 3500;
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");

const mongoURI = "mongodb+srv://Adrian_Vargas:ivfRWPBucvaPfcG1@cluster0.s7miejw.mongodb.net/"; //Password

const dbName = "UltimateMaker";

mongoose.connect(`${mongoURI}${dbName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//MongoDB uses a limit of 16MB per document, so to prevent possible errors, we prevent any upload that surpases that limit.
app.use(express.json({ limit: "16mb" }));

// Creating a cookie when required and encrypting it.
app.use(
    session({
        secret: "omniman",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: `${mongoURI}${dbName}` }),
    }),
);

// Redirecting users that have not been logged.
app.use("/index.html", (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/login.html");
    }
    next();
});

app.get("/", (req, res) => {
    if (!req.session.user) {
        res.redirect("/login.html");
    } else {
        res.redirect("/index.html");
    }
});

// Schemas for database documents.
const userSchema = new mongoose.Schema({
    email: String,
    nickname: String,
    password: String,
    isPro: {
        type: Boolean,
        default: false,
    },
    creationDate: {
        type: Date,
        default: new Date(),
    },
});

const skillSchema = new mongoose.Schema({
    name: String,
    desc: String,
    power: Number,
    color: Number,
    type: Number,
    img: String,
});

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const bannerSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    color: {
        type: String,
        default: "#FFFFFF",
    },
    bgColor: {
        type: String,
        default: "#524AA6",
    },
    backgroundImg: String,
    profileImg: String,
});

//Storing schemas and assigning them to a collection.
const USER = mongoose.model("users", userSchema);

const SKILL = mongoose.model("skills", skillSchema);

const ADMIN = mongoose.model("admins", adminSchema);

const BANNER = mongoose.model("banners", bannerSchema);

/*
Retrieves the users from the database and sends the data back. Users can be filtered by the query contained on the request.
*/
app.post("/get-users", async (req, res) => {
    console.log("Obteniendo info del usuario...");

    if (req.session.user) {
        const query = req.body.query || {};

        if ("email" in query) {
            query.email = { $regex: query.email, $options: "i" };
        } else if ("nickname" in query) {
            query.nickname = { $regex: query.nickname, $options: "i" };
        }

        const requestedData = await USER.find(query).select("-password");

        if (requestedData) {
            console.log("Usuarios encontrados");
            res.json(requestedData);
        } else {
            console.log("No se han encontrado usuarios");
            res.status(404).send("Users not found");
        }
    } else {
        console.log("Intento de encontrar usuarios sin iniciar sesión!");
        res.status(401).send("Trying to retrieve user data without being logged in!");
    }
});

//Retrieves banner data from the specified user.
app.post("/get-banner", async (req, res) => {
    console.log("Obteniendo banner del usuario...");

    if (req.session.user) {
        const requestedBanner = await BANNER.findOne(req.body);

        if (requestedBanner) {
            res.json(requestedBanner);
            console.log("Banner encontrado");
        } else {
            console.log("No se han encontrado usuarios");
            res.status(404);
        }
    } else {
        console.log("Intento de encontrar usuarios sin iniciar sesión!");
        res.status(401);
    }
});

/*
We save or update a skill depending on the request. If an _id is provided, then we update the document with that id.
Else, we create a new skill with the data provided.
*/
app.post("/save-skill", async (req, res) => {
    console.log("Intento de guardar habilidad recibido!");

    if (req.session.user) {
        if (req.body._id) {
            /*
            It is necessary to destructure the data to ensure that the _id of the document 
            is not mixed with the data to update.
            */
            const { _id, ...updateData } = req.body;

            try {
                const updatedSkill = await SKILL.findByIdAndUpdate(_id, updateData);

                if (updatedSkill) {
                    console.log("Habilidad actualizada correctamente!");
                    res.status(200).send("Skill updated successfully");
                } else {
                    console.log("No se encontró la habilidad para actualizar!");
                    res.status(404).send("Skill not found");
                }
            } catch (error) {
                console.error("Error al actualizar la habilidad:", error);
                res.status(500).send("Error on skill update");
            }
        } else {
            try {
                const newSkill = new SKILL(req.body);

                await newSkill.save();

                console.log("Nueva habilidad guardada correctamente!");
            } catch (e) {
                console.error("Error al guardar una nueva habilidad: ", e);
            }

            res.status(200).send("Skill saved successfully");
        }
    } else {
        console.log("Intento de guardar habilidad sin iniciar sesión!");
        res.status(401).send("Trying to save a skill without being logged in!");
    }
});

/*
Deletes the skill by his document _id. The _id is provided by the request and if it's valid then we
delete the document.
*/
app.post("/delete-skill", async (req, res) => {
    console.log("Intento de eliminar habilidad...");

    if (req.session.user) {
        try {
            const deletedSkill = await SKILL.findByIdAndDelete(req.body._id);

            if (deletedSkill) {
                console.log("Habilidad eliminada correctamente");
                res.status(200).send("Skill deleted successfully");
            } else {
                console.log("No se encontró la habilidad para eliminar");
                res.status(404).send("Skill found found");
            }
        } catch (error) {
            console.error("Error al eliminar la habilidad:", error);
            res.status(500).send("Error on skill deleting");
        }
    } else {
        console.log("Intento de eliminar habilidad sin iniciar sesión!");
        res.status(401).send("Trying to delete skill without logging in!");
    }
});


/*
Gets the requested skills, can be used with a query from the client to filter the skills 
to search by name, type or color.
*/
app.post("/get-skills", async (req, res) => {
    console.log("Obteniendo habilidades...");

    if (req.session.user) {
        let query = req.body;

        Object.keys(query).forEach((key) => {
            const value = query[key];
            if (value === null) {
                delete query[key];
            }
        });

        query.name = { $regex: query.name, $options: "i" };

        console.log(query);

        const requestedSkills = await SKILL.find(query);

        if (requestedSkills) {
            res.json(requestedSkills);
            console.log("Habilidades obtenidas");
        } else {
            console.log("No se han encontrado habilidades");
            res.status(404).send();
        }
    } else {
        console.log("Intento de guardar habilidad sin iniciar sesión!");
        res.status(401).send();
    }
});

/*
Returns an array of the current amount of skills of each color. Meant for being used
directly over ChartJS in the frontend.
*/
app.post("/get-skill-stats", async (req, res) => {
    if (req.session.user) {
        let data = [];

        for (let i = 0; i < 4; i++) {
            data.push(await SKILL.countDocuments({ color: i }));
        }

        res.json(data);
    } else {
        console.log("Intento de guardar habilidad sin iniciar sesión!");
        res.status(401);
    }
});

/*
Tries to login the user and create a session cookie for the browser that requested it. If the credentials do not
match, the request is denied and sends back to the client the reason why it was denied.
*/
app.post("/try-login", async (req, res) => {
    console.log("Intento de login recibido!");

    let userData = req.body;

    const userDocument = await ADMIN.findOne({ username: userData.username });

    if (!userDocument) {
        console.log("Error: este usuario no existe!");
        return res.status(200).send(true);
    }

    if (userData.password === userDocument.password) {
        console.log(`Usuario '${userDocument.username}' encontrado con contraseña '${userDocument.password}'`);

        req.session.user = {
            userId: userDocument._id,
        };

        console.log("Sesion creada!");
        res.status(200).send();
    } else {
        console.log("Usuario existe, pero contraseña incorrecta!");
    }
});


/*
Destroys the cookie of the browser who requested it. By destroying the cookie the user logs off.
*/
app.post("/logout", (req, res) => {
    console.log("Intento de cierre de sesión recibido!");

    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            res.status(500).send();
        } else {
            console.log("Sesión cerrada con éxito!");
            res.status(200).send();
        }
    });
});

/*
Deletes the selected user and his banner by the user _id of the document.
*/
app.post("/delete-user", async (req, res) => {
    console.log("Intentando borrar usuario...");

    if (req.session.user) {
        const deletedUser = await USER.findByIdAndDelete(req.body._id);
        const deletedBanner = await BANNER.findOneAndDelete({ userId: req.body._id });

        if (deletedUser && deletedBanner) {
            console.log("Usuario borrado!");

            res.status(200).send();
        } else {
            console.log("No se ha encontrado el usuario a borrar!");
            res.status(404).send();
        }
    } else {
        console.log("Intento de borrar usuario sin iniciar sesión!");
        res.status(401).send();
    }
});

/*
Allows to reset the selected user password. It generates a random one and notifies the user.

It does not work yet, we need to work about getting a way to send the temporal password to the user.
We lack a mail server, so we need to find other solutions. It isnt a problem anyways, the user is able to
do it by himself by his profile and get a new password. This method is intented for rare cases where the user
is not able to do it by himself because of a bug or something similar.
*/
app.post("/reset-password", async (req, res) => {
    console.log("Intentando reset contraseña de usuario...");

    if (req.session.user) {
    } else {
        console.log("Intento de resetear contraseña de usuario sin iniciar sesión!");
        res.status(401).send();
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

//Opening and configuring the path of the index.html file to serve it as the homepage.
const path = require("path");

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.use(express.static(path.join(__dirname, "public")));
