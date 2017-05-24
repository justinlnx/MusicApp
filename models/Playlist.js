module.exports = function(sequelize, DataType) {
    var Playlist = sequelize.define('Playlist', {
        name: {
            type: DataType.STRING,
            field: 'name'
        }
    }, {
        classMethods: {
            associate: function(models) {
                Playlist.belongsToMany(models.Song, {
                    through: "SongsPlaylists"
                });
                Playlist.belongsToMany(models.User, {
                    through: "UsersPlaylists"
                });
            }
        }
    });

    return Playlist;
};
