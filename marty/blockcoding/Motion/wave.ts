javascriptGenerator['marty_wave'] = function (block) {
    const side = block.getFieldValue('SIDE');
    const code = `await makerKit.hw.run(routineContext, "marty.wave", ${side});\n`;
    return code;
};
