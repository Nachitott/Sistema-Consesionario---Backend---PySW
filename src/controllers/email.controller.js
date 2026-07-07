const { Email } = require('../../config/database');
const { Resend } = require("resend");

// Se inicializa resend solo si la api key está presente para evitar errores fatales en el arranque si no está configurada
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const emailCtrl = {};

// Crear una nueva suscripción
emailCtrl.agregarEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Verificar si ya existe una suscripción para este email
        let suscripcion = await Email.findOne({ where: { email } });

        if (suscripcion) {
            if (suscripcion.activo) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Este correo electrónico ya se encuentra suscrito.'
                });
            } else {
                // Si estaba inactivo, lo reactivamos
                suscripcion.activo = true;
                suscripcion.fecha = new Date();
                await suscripcion.save();
            }
        } else {
            // Si no existe, lo creamos
            suscripcion = await Email.create({
                email,
                fecha: new Date(),
                activo: true
            });
        }

        // Enviar email de confirmación
        if (resend) {
            try {
                await resend.emails.send({
                    from: "Concesionaria <onboarding@resend.dev>",
                    to: suscripcion.email,
                    subject: "Suscripción confirmada",
                    html: `
                        <h2>¡Gracias por suscribirte!</h2>
                        <p>Tu correo fue registrado correctamente.</p>
                        <p>Te enviaremos novedades y promociones de nuestra concesionaria.</p>
                    `
                });
            } catch (error) {
                console.error("Error enviando email con Resend:", error);
            }
        } else {
            console.warn("Resend API Key no configurada, se omitió el envío del correo de confirmación.");
        }

        res.status(201).json({
            ok: true,
            msg: 'Suscripción registrada exitosamente.',
            suscripcion
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor al procesar la suscripción.'
        });
    }
};

// Obtener todas las suscripciones (para admins / vendedores)
emailCtrl.getEmails = async (req, res) => {
    try {
        const suscripciones = await Email.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(suscripciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno al obtener las suscripciones.'
        });
    }
};

// Desactivar una suscripción (dar de baja/unsubscribe)
emailCtrl.desactivarEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const suscripcion = await Email.findByPk(id);

        if (!suscripcion) {
            return res.status(404).json({
                ok: false,
                msg: 'Suscripción no encontrada.'
            });
        }

        if (!suscripcion.activo) {
            return res.status(400).json({
                ok: false,
                msg: 'La suscripción ya se encuentra inactiva.'
            });
        }

        suscripcion.activo = false;
        await suscripcion.save();

        res.json({
            ok: true,
            msg: 'Suscripción dada de baja exitosamente.',
            suscripcion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno al desactivar la suscripción.'
        });
    }
};

module.exports = emailCtrl;
