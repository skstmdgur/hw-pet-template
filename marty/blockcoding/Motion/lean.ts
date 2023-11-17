javascriptGenerator['marty_lean'] = function (block) {
    const side = block.getFieldValue('SIDE');
    const time = block.getFieldValue('TIME');
    const code = `await makerKit.hw.run(routineContext, "marty.lean", ${time}, ${side});\n`;
    return code;
};