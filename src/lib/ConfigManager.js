"use strict";
const readline = require('readline');
const fs = require("fs");


class ConfigManager {

    /**
     *
     * @param path where to read/write the config from/to
     * @param cfgModules array of classes that provide an own config to be registered
     *                   (these classes must have a the method `static getConfigTemplate` which returns a valid config template object)
     */
    constructor(path, cfgModules) {
        this._path = path;
        this._cfg = null;
        this._sectionList = [];

        // add all the config sections of the given modules TODO check if section already exists?
        if(cfgModules) {
            for(let i = 0; i < cfgModules.length; i++) {
                if(cfgModules[i].hasOwnProperty('getConfigTemplate')) {
                    let modSection = cfgModules[i].getConfigTemplate();
                    this._sectionList.push(modSection);
                } else {
                    throw new Error("Class '" + cfgModules[i].name + "' does not have a 'static getConfigTemplate()'");
                }
            }
        }
    }

    /**
     * Load the config from disk. If it doesn't exist, create it by interactively promting the user
     * @param callback(err)
     */
    loadOrCreate(callback) {
        // TODO: check if there are keys missing in the config and prompt the user to update it
        try {
            this._cfg = JSON.parse(fs.readFileSync(this._path));
        } catch (e) {
            // if the config doesn't exist, ask for interactive creation
            console.log("failed to load config, interactively creating a new one:  " + e);

            this._buildNewConfig(function (err) {
                if(err != null) {
                    callback(null, err);
                }

                // write the new config to disk
                let jsonContent = JSON.stringify(this._cfg, null, 4);
                fs.writeFileSync(this._path, jsonContent, 'utf8', function (err) {
                    if (err) {
                        console.log("An error occured while writing JSON Object to File.");
                        return callback(this._cfg, err);
                    }

                    console.log("JSON file has been saved.");

                    // successfully created and save a new config
                    return callback(this._cfg, null);
                }.bind(this));
            }.bind(this));

            return;
        }//end catch

        // successfully loaded an existing config
        return callback(this._cfg, null);
    }

    _buildNewConfig(callback) {

        console.log("---------------------------------------");
        console.log(" Welcome to the music-something setup! ");
        console.log("---------------------------------------");

        // go through all the config sections and build the new config
        this._cfg = {};
        let handleSection = (function (sectionId, nextSectionCallback) {
            if(sectionId >= this._sectionList.length) {
                console.log("<<<< DONE!! SAVING AND STARTING");
                return callback(null);
            }

            console.log("Section '" + this._sectionList[sectionId].section + "': " + this._sectionList[sectionId].description);
            this._cfg[this._sectionList[sectionId].section] = {};

            let handleOption = (function (elements, index, nextOptionCallback) {
                if(index >= elements.length) {
                    console.log();
                    return nextSectionCallback(sectionId+1, nextSectionCallback);
                }

                console.log(""+(index+1)+") " + elements[index].description);

                let defaultValueHint = "";
                if(elements[index].hasOwnProperty('standard'))
                    defaultValueHint = " [" + elements[index].standard + "]";

                let rl = readline.createInterface(process.stdin, process.stdout);
                rl.setPrompt("'"+elements[index].option+"'" + defaultValueHint + "> ");
                rl.on('line', function(line) {
                    let givenInput = null;
                    if(line === "." || line === '""' || line === "''") {
                        // the user affirms that he wants to leave this field blank
                        givenInput = "";
                    } else if(elements[index].hasOwnProperty('standard')) {
                        if(line === "")
                            givenInput = elements[index].standard;
                        else
                            givenInput = line;
                    } else {
                        givenInput = line;
                    }
                    if(!(line === "." || line === '""' || line === "''") && givenInput === "") {
                        return rl.prompt();
                    } else {
                        this._cfg[this._sectionList[sectionId].section][elements[index].option] = givenInput;

                        rl.close();
                        return nextOptionCallback(elements, index+1, nextOptionCallback);
                    }

                }.bind(this));//end onLine callback
                return rl.prompt();

            }.bind(this));//end handleOption
            return handleOption(this._sectionList[sectionId].elements, 0, handleOption);

        }.bind(this));//end handleSection
        return handleSection(0, handleSection);

    }//end '_buildNewConfig'

}

module.exports = ConfigManager;
