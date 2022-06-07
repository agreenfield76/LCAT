const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('hadgem_rcp85_tmin_jja', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    location: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    median: {
      type: DataTypes.REAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'hadgem_rcp85_tmin_jja',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "hadgem_rcp85_tmin_jja_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
