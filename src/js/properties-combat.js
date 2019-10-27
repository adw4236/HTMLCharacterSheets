let name = new function(){
    Property.call(this, "name");

    this.set = function(val){
        let name = this.get();

        for(let key in localStorage){
            if(key.startsWith("Character." + name)){
                let newKey = key.replace("Character\." + name, "Character\." + val);
                let value = localStorage.getItem(key);
                localStorage.removeItem(key);
                localStorage.setItem(newKey, value);
            }
        }

        $(document).attr("title", val);
        this.update();
        return true;
    };
    this.get = function(){
        return $(document).attr("title")
    };
};

new Property("class");
let level = new RestrictInt(Property, "level");
new Property("background");
new Property("player");
new Property("race");
new Property("alignment");
new RestrictInt(Property, "xp");

let str = new RestrictInt(Property, "str_score");
let str_mod = new RestrictInt(AutoProperty, "str_mod", [str], function(){
    return Math.floor((str.get() - 10) / 2);
});
let dex = new RestrictInt(Property, "dex_score");
let dex_mod = new RestrictInt(AutoProperty, "dex_mod", [dex], function(){
    return Math.floor((dex.get() - 10) / 2);
});
let con = new RestrictInt(Property, "con_score");
let con_mod = new RestrictInt(AutoProperty, "con_mod", [con], function(){
    return Math.floor((con.get() - 10) / 2);
});
let int = new RestrictInt(Property, "int_score");
let int_mod = new RestrictInt(AutoProperty, "int_mod", [int], function(){
    return Math.floor((int.get() - 10) / 2);
});
let wis = new RestrictInt(Property, "wis_score");
let wis_mod = new RestrictInt(AutoProperty, "wis_mod", [wis], function(){
    return Math.floor((wis.get() - 10) / 2);
});
let cha = new RestrictInt(Property, "cha_score");
let cha_mod = new RestrictInt(AutoProperty, "cha_mod", [cha], function(){
    return Math.floor((cha.get() - 10) / 2);
});

new ToggleProperty("inspiration");
let proficiency = new RestrictInt(AutoProperty, "proficiency", [level], function(){
    return Math.floor((level.get() - 1) / 4) + 2;
});

let str_save = new ToggleProperty("str_save");
new RestrictInt(AutoProperty, "str_save_bonus", [str_save, proficiency, str_mod], function(){
    return str_save.get() ? proficiency.get() + str_mod.get() : str_mod.get();
});
let dex_save = new ToggleProperty("dex_save");
new RestrictInt(AutoProperty, "dex_save_bonus", [dex_save, proficiency, dex_mod], function(){
    return dex_save.get() ? proficiency.get() + dex_mod.get() : dex_mod.get();
});
let con_save = new ToggleProperty("con_save");
new RestrictInt(AutoProperty, "con_save_bonus", [con_save, proficiency, con_mod], function(){
    return con_save.get() ? proficiency.get() + con_mod.get() : con_mod.get();
});
let int_save = new ToggleProperty("int_save");
new RestrictInt(AutoProperty, "int_save_bonus", [int_save, proficiency, int_mod], function(){
    return int_save.get() ? proficiency.get() + int_mod.get() : int_mod.get();
});
let wis_save = new ToggleProperty("wis_save");
new RestrictInt(AutoProperty, "wis_save_bonus", [wis_save, proficiency, wis_mod], function(){
    return wis_save.get() ? proficiency.get() + wis_mod.get() : wis_mod.get();
});
let cha_save = new ToggleProperty("cha_save");
new RestrictInt(AutoProperty, "cha_save_bonus", [cha_save, proficiency, cha_mod], function(){
    return cha_save.get() ? proficiency.get() + cha_mod.get() : cha_mod.get();
});

let acrobatics = new ToggleProperty("acrobatics", 3);
new RestrictInt(AutoProperty, "acrobatics_bonus", [acrobatics, proficiency, dex_mod], function(){
    return dex_mod.get() + (acrobatics.get() * proficiency.get());
});
let animal_handling = new ToggleProperty("animal_handling", 3);
new RestrictInt(AutoProperty, "animal_handling_bonus", [animal_handling, proficiency, wis_mod], function(){
    return wis_mod.get() + (animal_handling.get() * proficiency.get());
});
let arcana = new ToggleProperty("arcana", 3);
new RestrictInt(AutoProperty, "arcana_bonus", [arcana, proficiency, int_mod], function(){
    return int_mod.get() + (arcana.get() * proficiency.get());
});
let athletics = new ToggleProperty("athletics", 3);
new RestrictInt(AutoProperty, "athletics_bonus", [athletics, proficiency, str_mod], function(){
    return str_mod.get() + (athletics.get() * proficiency.get());
});
let deception = new ToggleProperty("deception", 3);
new RestrictInt(AutoProperty, "deception_bonus", [deception, proficiency, cha_mod], function(){
    return cha_mod.get() + (deception.get() * proficiency.get());
});
let history = new ToggleProperty("history", 3);
new RestrictInt(AutoProperty, "history_bonus", [history, proficiency, int_mod], function(){
    return int_mod.get() + (history.get() * proficiency.get());
});
let insight = new ToggleProperty("insight", 3);
new RestrictInt(AutoProperty, "insight_bonus", [insight, proficiency, wis_mod], function(){
    return wis_mod.get() + (insight.get() * proficiency.get());
});
let intimidation = new ToggleProperty("intimidation", 3);
new RestrictInt(AutoProperty, "intimidation_bonus", [intimidation, proficiency, cha_mod], function(){
    return cha_mod.get() + (intimidation.get() * proficiency.get());
});
let investigation = new ToggleProperty("investigation", 3);
new RestrictInt(AutoProperty, "investigation_bonus", [investigation, proficiency, int_mod], function(){
    return int_mod.get() + (investigation.get() * proficiency.get());
});
let medicine = new ToggleProperty("medicine", 3);
new RestrictInt(AutoProperty, "medicine_bonus", [medicine, proficiency, wis_mod], function(){
    return wis_mod.get() + (medicine.get() * proficiency.get());
});
let nature = new ToggleProperty("nature", 3);
new RestrictInt(AutoProperty, "nature_bonus", [nature, proficiency, int_mod], function(){
    return int_mod.get() + (nature.get() * proficiency.get());
});
let perception = new ToggleProperty("perception", 3);
let perception_bonus = new RestrictInt(AutoProperty, "perception_bonus", [perception, proficiency, wis_mod], function(){
    return wis_mod.get() + (perception.get() * proficiency.get());
});
let performance = new ToggleProperty("performance", 3);
new RestrictInt(AutoProperty, "performance_bonus", [performance, proficiency, cha_mod], function(){
    return cha_mod.get() + (performance.get() * proficiency.get());
});
let persuasion = new ToggleProperty("persuasion", 3);
new RestrictInt(AutoProperty, "persuasion_bonus", [persuasion, proficiency, cha_mod], function(){
    return cha_mod.get() + (persuasion.get() * proficiency.get());
});
let religion = new ToggleProperty("religion", 3);
new RestrictInt(AutoProperty, "religion_bonus", [religion, proficiency, int_mod], function(){
    return int_mod.get() + (religion.get() * proficiency.get());
});
let sleight_of_hand = new ToggleProperty("sleight_of_hand", 3);
new RestrictInt(AutoProperty, "sleight_of_hand_bonus", [sleight_of_hand, proficiency, dex_mod], function(){
    return dex_mod.get() + (sleight_of_hand.get() * proficiency.get());
});
let stealth = new ToggleProperty("stealth", 3);
new RestrictInt(AutoProperty, "stealth_bonus", [stealth, proficiency, dex_mod], function(){
    return dex_mod.get() + (stealth.get() * proficiency.get());
});
let survival = new ToggleProperty("survival", 3);
new RestrictInt(AutoProperty, "survival_bonus", [survival, proficiency, wis_mod], function(){
    return wis_mod.get() + (survival.get() * proficiency.get());
});

new RestrictInt(AutoProperty, "passive_perception", [perception_bonus], function(){
    return 10 + perception_bonus.get();
});
new LongProperty("proficiencies");

new RestrictInt(Property, "ac");
new RestrictInt(AutoProperty, "initiative", [dex_mod], function(){
    return dex_mod.get();
});
new RestrictInt(Property, "speed");

new RestrictInt(Property, "max_hp");
new Property("hp");
new Property("temp_hp");
new Property("total_hit_dice");
new Property("hit_dice");
new ToggleProperty("death_save_success_1");
new ToggleProperty("death_save_success_2");
new ToggleProperty("death_save_success_3");
new ToggleProperty("death_save_failure_1");
new ToggleProperty("death_save_failure_2");
new ToggleProperty("death_save_failure_3");

new Property("attack_1");
new RestrictInt(Property, "attack_1_bonus");
new Property("attack_1_damage");
new Property("attack_2");
new RestrictInt(Property, "attack_2_bonus");
new Property("attack_2_damage");
new Property("attack_3");
new RestrictInt(Property, "attack_3_bonus");
new Property("attack_3_damage");
new LongProperty("attacks");

new RestrictInt(Property, "cp");
new RestrictInt(Property, "sp");
new RestrictInt(Property, "ep");
new RestrictInt(Property, "gp");
new RestrictInt(Property, "pp");
new LongProperty("equipment");

new LongProperty("personality_traits");
new LongProperty("ideals");
new LongProperty("bonds");
new LongProperty("flaws");

new LongProperty("features");