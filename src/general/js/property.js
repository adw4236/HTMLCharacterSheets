/**
 * A master list of properties by name to their associated objects for easy access.
 * @type {{}}
 */
const Character = {};

/**
 * Helper function to get the key to store in localstorage for consistency
 * @param name - The name of the property being stored.
 * @returns {string} The key to use for localstorage
 */
function storedKey(name){
    return "Character." + Character["name"].get() + "." + name;
}

/**
 * Helper function to get the key to store metadata in localstorage for consistency
 * @param name - The name of the property with the metadata.
 * @param metadata - The name of the metadata being stored.
 * @returns {string} The key to use for localstorage
 */
function metadataKey(name, metadata){
    return storedKey(name) + "." + metadata;
}

/**
 * A basic property that stores a single value and will notify all handlers when the value changes.
 *
 * @param name - The name of this property, a unique identifier
 * @constructor Adds this property to the master list of properties to be accessed.
 */
function Property(name){
    Character[name] = this;

    /**
     * The constructor that will be used to create a field for the property. This should be from the field.js file.
     */
    this.fieldType = TextField;

    /* Functions that are called when this property is updated */
    let handlers = [];
    /* Other properties that should be updated when this property is updated */
    let dependants = [];

    /**
     * Sets the value of this property and updates all handlers.
     * @param val - The value to set
     * @returns {boolean} True if the update was a success false otherwise.
     */
    this.set = function(val){
        if(val) localStorage.setItem(storedKey(name), val);
        else localStorage.removeItem(storedKey(name));
        this.update();
        return true;
    };
    /**
     * Gets the property value and returns it.
     * @returns The value of this property.
     */
    this.get = function(){
        return localStorage.getItem(storedKey(name));
    };
    /**
     * Updates all of the handlers with the current value of the property as well as all
     * of the properties that depend on this one.
     */
    this.update = function(){
        let val = this.get();
        dependants.forEach(function(dependant){
            dependant.update();
        });
        handlers.forEach(function(handler){
            handler(val);
        });
    };
    /**
     * Stores metadata for this property that can be retrieved as needed.
     * @param data - A map containing key value pairs to store.
     */
    this.setMetadata = function(data){
        for(let key in data){
            if(data[key] !== null) localStorage.setItem(metadataKey(name, key), data[key]);
            else localStorage.removeItem(metadataKey(name, key));
        }
    };
    /**
     * Retrieves a piece of metadata based on the key that was used to store it.
     * @param key - The key that was used to store the metadata.
     */
    this.getMetadata = function(key){
        return localStorage.getItem(metadataKey(name, key));
    };

    /**
     * Adds a handler function that will be called whenever this property changes with the parameter being the
     * new value of the property.
     *
     * @param handler - The handler function
     */
    this.addHandler = function(handler){
        handlers.push(handler);
    };
    /**
     * Adds a property to the list of properties that will be updated when this property is updated.
     *
     * @param property - A property who's update method will be called when this properties update method is called.
     */
    this.addDependant = function(property){
        dependants.push(property);
    };
}

/**
 * A direct subset of a basic property with the field type changed to LongTextField.  This is used purely for
 * convenience.
 *
 * @param name - The name of the property being created.
 * @constructor Sets the field type.
 */
function LongProperty(name){
    Property.call(this, name);
    this.fieldType = LongTextField;
}

/**
 * This property will automatically be calculated based on a function passed in, but can be overridden to have
 * a custom value.
 *
 * @param name - The name of the property being created.
 * @param dependencies - The list of dependencies that the calculate function uses. This property will automatically
 *                       be added as a dependant to these properties.
 * @param calculate - A function used to calculate the value of this property.
 * @constructor Adds this property as a dependent to the dependency properties.
 */
function AutoProperty(name, dependencies, calculate){
    Property.call(this, name);
    this.fieldType = AutoField;

    /**
     * If this property is set to something specifically and is not relying on auto calculate.
     * @type {boolean}
     */
    this.overridden = false;

    // Add as dependent so this property is updated when the dependencies are updated.
    dependencies.forEach(function(dependency){
        dependency.addDependant(this);
    }.bind(this));

    let superSet = this.set.bind(this);
    let superGet = this.get.bind(this);

    /**
     * Sets the property as normal, but also sets the overridden field. If the value provided evaluates to false, the
     * property will reset and overridden will no longer be true.
     * @param val - The value to set the property to.
     * @returns {Boolean} if the property was set successfully
     */
    this.set = function(val){
        if(superSet(val)){
            this.overridden = true;
            return true;
        }
        this.overridden = false;
        return false;
    };

    /**
     * Gets the property from storage if the property is overridden, otherwise gets the auto calculated value.
     * @returns The value of this property.
     */
    this.get = function(){
        let val = superGet();
        if(val !== null){
            this.overridden = true;
            return val;
        }
        return calculate();
    };

    /**
     * If the property is overridden, this will reset the override and the property will go back to auto calculation.
     */
    this.reset = function(){
        this.set(null);
    };

}

/**
 * A wrapper for any property that restricts the values for set and get to be integers.
 *
 * @param type - The constructor of the type of property this one is wrapping.
 * @params The rest of the parameters are passed to the constructor of type.
 * @constructor Wraps the provided type.
 */
function RestrictInt(type){
    type.call(this, ...[].slice.call(arguments, 1));

    let superSet = this.set.bind(this);
    let superGet = this.get.bind(this);

    /**
     * Sets the value of the property to the value provided.  If the value provided cannot be turned into an integer,
     * the property is not set and false is returned.
     *
     * @param val - The value to set, can be any value that can be converted into an integer.
     * @returns {Boolean} If the set was successful or not.
     */
    this.set = function(val){
        if(isNaN(val)) return false;
        if(val === null) val = 0;
        return superSet(parseInt(val));
    };
    /**
     * Get the value of the property as an integer.  If the stored value is not an integer, 0 will be returned.
     *
     * @returns The value of the property.
     */
    this.get = function(){
        let val = superGet();
        if(val === null || isNaN(val)) return 0;
        return parseInt(val);
    };
}

/**
 * This property will store an integer that is the cycle the toggle is on and will repeat that cycle over and over
 * when it is toggled.
 *
 * @param name - The name of the property being created.
 * @param cycles - Optional number of cycles in this property (defaults to 2)
 * @constructor Sets the cycles of the property.
 */
function ToggleProperty(name, cycles){
    RestrictInt.call(this, Property, name);
    this.fieldType = ToggleField;

    /**
     * The maximum integer this property can be toggled to before wrapping back to zero.
     * @type {number}
     */
    this.cycles = cycles || 2;

    /**
     * Toggles this property by incrementing the cycle.  If the cycle is greater than the max cycle, it is reset to 0.
     */
    this.toggle = function(){
        this.set((this.get() + 1) % this.cycles);
    };
}

/**
 * This property is able to store an image instead of text if it is provided as a file from a file input.
 *
 * @param name - The name of the property being created.
 * @constructor Creates a file reader that can read images.
 */
function ImageProperty(name){
    Property.call(this, name);
    this.fieldType = ImageField;

    let reader = new FileReader();

    // Called when reader finishes a job such as readAsDataURL().
    reader.addEventListener("load", function(){
        this.set(reader.result);
    }.bind(this));

    /**
     * Sets the value of this property based on a file provided.  Set can be used by itself if you already have the
     * image as a base64 url.
     *
     * @param file - The blob file to set, e.g. from a file input element.
     */
    this.setFile = function(file){
        reader.readAsDataURL(file);
    }
}