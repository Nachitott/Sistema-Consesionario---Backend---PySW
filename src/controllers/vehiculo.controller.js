const { Vehiculo } = require('../../config/database');
const vehiculoCtrl = {};

// Obtener todos los vehículos
vehiculoCtrl.getVehiculos = async (req, res) => {
    try {
        const vehiculos = await Vehiculo.findAll();
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los vehículos',
            error: error.message
        });
    }
};

// Crear un nuevo vehículo
vehiculoCtrl.createVehiculo = async (req, res) => {
    try {
        let {
            marca, modelo, anio, version, kilometraje,
            combustible, transmision, color, precio,
            descuento, descripcion, estado, imagenes, visible
        } = req.body;

        // Normalizar para siempre almacenar un arreglo de strings
        if (typeof imagenes === 'string') {
            imagenes = [imagenes];
        } else if (!Array.isArray(imagenes)) {
            imagenes = [];
        }

        const nuevoVehiculo = await Vehiculo.create({
            marca, modelo, anio, version, kilometraje,
            combustible, transmision, color, precio,
            descuento, descripcion, estado, imagenes, visible
        });

        res.status(201).json({
            message: 'Vehículo creado exitosamente',
            vehiculo: nuevoVehiculo
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear el vehículo',
            error: error.message
        });
    }
};

// Obtener un vehículo por ID
vehiculoCtrl.getVehiculoById = async (req, res) => {
    try {
        const { id } = req.params;
        const vehiculo = await Vehiculo.findByPk(id);

        if (!vehiculo) {
            return res.status(404).json({
                message: 'Vehículo no encontrado'
            });
        }

        res.json(vehiculo);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el vehículo',
            error: error.message
        });
    }
};

// Actualizar un vehículo por ID
vehiculoCtrl.updateVehiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const vehiculo = await Vehiculo.findByPk(id);

        if (!vehiculo) {
            return res.status(404).json({
                message: 'Vehículo no encontrado'
            });
        }

        const dataToUpdate = { ...req.body };
        if (dataToUpdate.imagenes !== undefined) {
            if (typeof dataToUpdate.imagenes === 'string') {
                dataToUpdate.imagenes = [dataToUpdate.imagenes];
            } else if (!Array.isArray(dataToUpdate.imagenes)) {
                dataToUpdate.imagenes = [];
            }
        }

        await vehiculo.update(dataToUpdate);

        res.json({
            message: 'Vehículo actualizado exitosamente',
            vehiculo
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar el vehículo',
            error: error.message
        });
    }
};

// Eliminar un vehículo por ID
vehiculoCtrl.deleteVehiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const vehiculo = await Vehiculo.findByPk(id);

        if (!vehiculo) {
            return res.status(404).json({
                message: 'Vehículo no encontrado'
            });
        }

        await vehiculo.destroy();

        res.json({
            message: 'Vehículo eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar el vehículo',
            error: error.message
        });
    }
};

// Variable en memoria para caché simple de cotizaciones
let cotizacionesCache = {
    data: null,
    lastUpdated: 0
};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora de duración de la caché

// Obtener cotizaciones de divisas como endpoint proxy
vehiculoCtrl.getCotizaciones = async (req, res) => {
    try {
        const now = Date.now();
        // Retornar caché si aún es válida
        if (cotizacionesCache.data && (now - cotizacionesCache.lastUpdated < CACHE_DURATION)) {
            return res.json(cotizacionesCache.data);
        }

        // Realizamos peticiones a las APIs públicas en paralelo
        const [frankfurterRes, dolarRes] = await Promise.allSettled([
            fetch('https://api.frankfurter.app/latest?from=USD'),
            fetch('https://dolarapi.com/v1/dolares')
        ]);

        const result = {
            base: 'USD',
            rates: {}
        };

        // Procesar Frankfurter (divisas internacionales)
        if (frankfurterRes.status === 'fulfilled' && frankfurterRes.value.ok) {
            const data = await frankfurterRes.value.json();
            if (data && data.rates) {
                result.rates.EUR = data.rates.EUR;
                result.rates.BRL = data.rates.BRL;
                result.rates.CLP = data.rates.CLP || 920.0;
                result.rates.UYU = data.rates.UYU || 40.0;
            }
        }

        // Procesar DolarApi (cotización ARS)
        if (dolarRes.status === 'fulfilled' && dolarRes.value.ok) {
            const data = await dolarRes.value.json();
            // Buscamos el Dólar Blue y el Dólar Oficial
            const oficial = data.find(d => d.casa === 'oficial');
            const blue = data.find(d => d.casa === 'blue');
            if (oficial) result.rates.ARS_OFICIAL = oficial.venta;
            if (blue) result.rates.ARS_BLUE = blue.venta;
        }

        // Si fallaron ambas y no tenemos caché previa, lanzamos error
        if (Object.keys(result.rates).length === 0) {
            throw new Error('No se pudo obtener cotizaciones de ninguna de las fuentes.');
        }

        // Guardar en caché
        cotizacionesCache.data = result;
        cotizacionesCache.lastUpdated = now;

        res.json(result);
    } catch (error) {
        // Retornar caché anterior como fallback en caso de error de red o timeout
        if (cotizacionesCache.data) {
            return res.json(cotizacionesCache.data);
        }
        res.status(500).json({
            message: 'Error al obtener cotizaciones de divisas',
            error: error.message
        });
    }
};

module.exports = vehiculoCtrl;