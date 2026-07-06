const { Venta, Usuario } = require("../../config/database");
const { Op, Sequelize } = require("sequelize");

const reporteCtrl = {};

reporteCtrl.getreportegeneral = async (req, res) => {
    try {
        const { mes } = req.query; // "2026-07"

        const where = {};

 if (mes) {

            const inicio = new Date(`${mes}-01`);
            const fin = new Date(inicio);
            fin.setMonth(fin.getMonth() + 1);

            where.fechaVenta = {
                [Op.gte]: inicio,
                [Op.lt]: fin
            };
        }

        // Cantidad de ventas
        const ventasTotales = await Venta.count({
            where
        });

        // Ingresos
        const ingresosTotales = await Venta.sum("precioFinal", {
            where
        });

        // Ranking de vendedores
        const vendedores = await Venta.findAll({

            attributes: [
                "vendedorId",
                [
                    Sequelize.fn("COUNT", Sequelize.col("Venta.id")),
                    "cantidadVentas"
                ],
                [
                    Sequelize.fn("SUM", Sequelize.col("precioFinal")),
                    "ingresos"
                ]
            ],

            include: [
                {
                    model: Usuario,
                    as: "vendedor",
                    attributes: ["nombre", "apellido"]
                }
            ],

            where,

            group: [
                "vendedorId",
                "vendedor.id"
            ],

            order: [
                [
                    Sequelize.fn("COUNT", Sequelize.col("Venta.id")),
                    "DESC"
                ]
            ]

        });

        res.json({
            filtro: mes || "todos",
            ventasTotales,
            ingresosTotales,
            vendedores
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

module.exports = reporteCtrl;
