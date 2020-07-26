import fs from "fs";
import ConfigInterface from "interface/config";
import fetch from "node-fetch";

const configFile = fs.readFileSync("config.json", {encoding: "utf-8"});
const config = JSON.parse(configFile) as ConfigInterface;

const rulesetFile = fs.readFileSync(config.rulesetFile, {encoding: "utf-8"});
const ruleset = rulesetFile.split("\n");

let count = 0;

(async () => {
  console.time("blows");
  for (let epoch = 0; epoch < config.attack.epoch; epoch++) {
    let successfulBlows = 0;

    console.time("epoch");
    console.log("Epoch #"+epoch);
    console.log("Total blow count:", ruleset.length);
    for (let i = 0; i < ruleset.length / config.attack.blows; i++) {

      try {
        await runEpoch(ruleset, i, config.attack.blows, (blowNumber, url, statusCode) => {
          if (statusCode === 200) {console.error(blowNumber+".",url); count++; successfulBlows++;}
        });
      } catch(e) {
        console.error("EXECUTION SUCCESSFUL. TERMINATING SESSION.");
        process.exit(1);
      }
    }


    console.log();
    console.log("========[ EPOCH-LY REPORT ]========");

    console.timeEnd("epoch");
    console.log("Unfiltered on this Epoch:", successfulBlows);
    console.log("Defense rate:", 100 - (successfulBlows * 100 / ruleset.length), "%");
    console.log();
  }

  console.log("========[ FINAL REPORT ]========");
  console.log("Unfiltered:", count);
  console.log("Total Defense rate:", 100 - (count * 100 / (ruleset.length * config.attack.epoch)), "%");
  console.timeEnd("blows");
})();

function runEpoch(ruleset: string[], baseIndex: number, blows: number, callback: (blowNumber: number, url: string, statusCode: number) => void): Promise<void> {
  return new Promise<void> (
    (res, rej) => {
      let completed = 0;
      const max = ((baseIndex + 1) * blows > ruleset.length) ? ruleset.length - (baseIndex * blows) : blows;

      let j = baseIndex * blows;
      for (let i = 0; i < max; i++) {
        const url = encodeURI((config.attack.target)+(ruleset[j+i]));
        fetch(url, {
          method: "",
          headers: {
            "User-Agent": config.userAgent
          },
        }).then(
          (wa) => {
            callback(i, url, wa.status);
            completed++;
            if (completed === max) res(); 
          }
        ).catch(() => {
          rej();
        })
      }
      j++;
    }
  )
}


