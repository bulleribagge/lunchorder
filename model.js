var Sequelize = require('sequelize');

function Model() { }

Model.Order = {};

Model.create = function(callback) {
    
    var sequelize = new Sequelize(process.env.DB_URL, {
        timezone:'+02:00'
    });
    
    this.Order = sequelize.define('order', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: Sequelize.STRING(50),
        main: Sequelize.STRING(50),
        sideorder: Sequelize.STRING(50),
        sauce: Sequelize.STRING(50),
        drink: Sequelize.STRING(50),
        extra: Sequelize.STRING(50),
        canceled: Sequelize.BOOLEAN
    },{
        instanceMethods:{
            toString: function(){
                var res = "*" + this.username + "* " + this.main + " " + this.sideorder + " " + this.sauce + " " + this.drink  + " " + (this.extra == null ? "" : this.extra);
                return res;
            }
        }
    });
    
    sequelize.sync().then(function(){
        callback();
    }).catch(function(error){
        throw 'Ooops, something went wrong when syncing';
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