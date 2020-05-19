/**
 * Copyright (c) 2016-present Alibaba Group Holding Limited.
 * @license MIT found in the LICENSE file at https://github.com/alibaba/dawn/blob/master/LICENSE
 * @author DawnTeam
 */

import { Command, flags } from "@oclif/command";

export default class Exec extends Command {
  static description = "describe the command here";

  static flags = {
    help: flags.help({ char: "h" }),
  };
  static strict = false;

  async run() {
    const options = this.parse(Exec);
    console.log(options);
  }
}