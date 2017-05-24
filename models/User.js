module.exports = function(sequelize, DataType) {
    var User = sequelize.define('User', {
        name: {
            type: DataType.STRING,
            field: 'username'
        },
        password: {
            type: DataType.STRING,
            field: 'password'
        }
    }, {
        classMethods: {
            associate: function(models) {
                User.belongsToMany(models.Playlist, {
                    through: "UsersPlaylists"
                });
            }
        }
    });

    return User;
};
