const { DataTypes } = require('sequelize');
const sequelize = require('../config/databaseSequelize');

const PaparazziOrder = sequelize.define('PaparazziOrder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    paparazzi_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'paparazzi',
            key: 'id'
        }
    },
    paparazzi_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    customer_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    customer_email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    customer_phone: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    customer_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'),
        defaultValue: 'pending'
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    order_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'paparazzi_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance methods
PaparazziOrder.prototype.accept = async function() {
    this.status = 'accepted';
    this.updated_at = new Date();
    await this.save();
};

PaparazziOrder.prototype.reject = async function(adminNotes = null) {
    this.status = 'rejected';
    this.admin_notes = adminNotes;
    this.updated_at = new Date();
    await this.save();
};

PaparazziOrder.prototype.complete = async function() {
    this.status = 'completed';
    this.updated_at = new Date();
    await this.save();
};

PaparazziOrder.prototype.update = async function(updateData) {
    Object.assign(this, updateData);
    this.updated_at = new Date();
    await this.save();
};

// Static methods
PaparazziOrder.findAll = async function(filters = {}, limit = null, offset = 0) {
    const whereClause = {};

    if (filters.status) {
        whereClause.status = filters.status;
    }

    const options = {
        where: whereClause,
        order: [['created_at', 'DESC']]
    };

    if (limit) {
        options.limit = limit;
        options.offset = offset;
    }

    return await this.findAndCountAll(options);
};

PaparazziOrder.getCount = async function(filters = {}) {
    const whereClause = {};

    if (filters.status) {
        whereClause.status = filters.status;
    }

    return await this.count({ where: whereClause });
};

PaparazziOrder.prototype.toJSON = function() {
    const values = { ...this.get() };
    return values;
};

module.exports = PaparazziOrder;