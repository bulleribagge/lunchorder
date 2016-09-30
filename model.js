var Sequelize = require('sequelize');

function Model() { }

Model.Order = {};

Model.create = function(callback) {
    
    var sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
        host: process.env.DB_HOST,
        dialect: process.env.DB_ENGINE,
        port: process.env.DB_PORT,
        timezone:'+02:00',
        logging: false
    });
    
    this.Order = sequelize.define('order', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: Sequelize.STRING(50),
        restaurant: Sequelize.STRING(50),
        main: Sequelize.STRING(50),
        sideorder: Sequelize.STRING(50),
        sauce: Sequelize.STRING(50),
        drink: Sequelize.STRING(50),
        extra: Sequelize.STRING(50),
        canceled: Sequelize.BOOLEAN 
    },{
        instanceMethods:{
            toString: function(includeRestaurant){
                var res = "*" + this.username + "*";
                res += " " + this.main;
                if(this.sideorder)
                {
                    res += " " + this.sideorder;
                }
                if(this.sauce)
                {
                    res += " " + this.sauce;
                }
                if(this.drink)
                {
                    res += " " + this.drink;
                }
                if(this.extra)
                {
                    res += " " + this.extra;
                }

                if(includeRestaurant)
                {
                    res += " at " + this.restaurant;
                }
                return res;
            }
        }
    });
    
    sequelize.sync().then(function(){
        callback();
    }).catch(function(error){
        throw 'Ooops, something went wrong when syncing: ' + error;
    });
};

module.exports = Model; 

/*
id integer NOT NULL DEFAULT nextval('order_id_seq'::regclass),
  date timestamp without time zone, -- The date when the order was placed
  username character varying(50), -- The user who placed the order
  main character varying(50), -- The main dish of the order
  side character varying(50), -- Side dish of the order
  sauce character varying(50), -- Sauce of the order
  drink character varying(50), -- Drink of the order
  extra character varying(100), -- Extra information regarding the order
  canceled boolean DEFAULT false,
  CONSTRAINT order_pk PRIMARY KEY (id) 
 */