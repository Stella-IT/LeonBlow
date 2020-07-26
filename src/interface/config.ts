interface ConfigInterface {
  userAgent: string;
  rulesetFile: string;
  attack: {
    target: string;
    blows: number;
    epoch: number;
  }
}

export default ConfigInterface;
