const Character = {};

function storedKey(name){
    return "Character." + Character["name"].get() + "." + name;
}
function metadataKey(name, metadata){
    return storedKey(name) + "." + metadata;
}

function Property(name){
    Character[name] = this;
    this.fieldType = TextField;

    let handlers = [];
    let dependants = [];

    this.set = function(val){
        if(val) localStorage.setItem(storedKey(name), val);
        else localStorage.removeItem(storedKey(name));
        this.update();
        return true;
    };
    this.get = function(){
        return localStorage.getItem(storedKey(name));
    };
    this.update = function(){
        let val = this.get();
        dependants.forEach(function(dependant){
            dependant.update();
        });
        handlers.forEach(function(handler){
            handler(val);
        });
    };
    this.setMetadata = function(data){
        for(let key in data){
            if(data[key] !== null) localStorage.setItem(metadataKey(name, key), data[key]);
            else localStorage.removeItem(metadataKey(name, key));
        }
    };
    this.getMetadata = function(key){
        return localStorage.getItem(metadataKey(name, key));
    };

    this.addHandler = function(handler){
        handlers.push(handler);
    };
    this.addDependant = function(property){
        dependants.push(property);
    };
}

function LongProperty(name){
    Property.call(this, name);
    this.fieldType = LongTextField;
}

function AutoProperty(name, dependencies, calculate){
    Property.call(this, name);
    this.fieldType = AutoField;

    this.overridden = false;

    dependencies.forEach(function(dependency){
        dependency.addDependant(this);
    }.bind(this));

    let superSet = this.set;
    let superGet = this.get;

    this.set = function(val){
        this.overridden = Boolean(val);
        return superSet.call(this, val);
    };

    this.get = function(){
        let val = superGet.call(this);
        if(val !== null){
            this.overridden = true;
            return val;
        }
        return calculate();
    };

    this.reset = function(){
        this.set(null);
    };

}

function RestrictInt(type){
    type.call(this, ...[].slice.call(arguments, 1));

    let superSet = this.set;
    let superGet = this.get;

    this.set = function(val){
        if(isNaN(val)) return false;
        if(val === null) val = 0;
        return superSet.call(this, parseInt(val));
    };
    this.get = function(){
        let val = superGet.call(this);
        if(val === null || isNaN(val)) return 0;
        return parseInt(val);
    };
}

function ToggleProperty(name, cycles){
    RestrictInt.call(this, Property, name);
    this.fieldType = ToggleField;

    this.cycles = cycles || 2;

    this.toggle = function(){
        this.set((this.get() + 1) % this.cycles);
    };
}

function ImageProperty(name){
    Property.call(this, name);
    this.fieldType = ImageField;

    let reader = new FileReader();

    reader.addEventListener("load", function(){
        this.set(reader.result);
    }.bind(this));

    this.setFile = function(file){
        reader.readAsDataURL(file);
    }
}