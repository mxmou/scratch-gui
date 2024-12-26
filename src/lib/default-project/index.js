import projectData from './project-data';

/* eslint-disable import/no-unresolved */
import popWav from '!arraybuffer-loader!./83a9787d4cb6f3b7632b4ddfebf74367.wav';
import backdrop from '!raw-loader!./cd21514d0531fdffb22204e0ec5ed84a.svg';
import costume1 from '!raw-loader!./c5f76b65e30075c12d49ea8a8f7d6bad.svg';
import costume2 from '!raw-loader!./8a7da35c473972f88896ca73b7df2188.svg';
/* eslint-enable import/no-unresolved */

const defaultProject = translator => {
    let _TextEncoder;
    if (typeof TextEncoder === 'undefined') {
        _TextEncoder = require('text-encoding').TextEncoder;
    } else {
        /* global TextEncoder */
        _TextEncoder = TextEncoder;
    }
    const encoder = new _TextEncoder();

    const projectJson = projectData(translator);
    return [{
        id: 0,
        assetType: 'Project',
        dataFormat: 'JSON',
        data: JSON.stringify(projectJson)
    }, {
        id: '83a9787d4cb6f3b7632b4ddfebf74367',
        assetType: 'Sound',
        dataFormat: 'WAV',
        data: new Uint8Array(popWav)
    }, {
        id: 'cd21514d0531fdffb22204e0ec5ed84a',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(backdrop)
    }, {
        id: 'c5f76b65e30075c12d49ea8a8f7d6bad',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume1)
    }, {
        id: '8a7da35c473972f88896ca73b7df2188',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume2)
    }];
};

export default defaultProject;
