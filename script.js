
let contentFields = [];
let currentScale = 1;
let currentDevice = 'desktop';
function setView(view) {
    document.getElementById('previewButton').classList.toggle('active', view === 'preview');
    document.getElementById('codeButton').classList.toggle('active', view === 'code');
    document.getElementById('helpButton').classList.toggle('active', view === 'help');

    document.getElementById('previewMode').style.display = view === 'preview' ? 'block' : 'none';
    document.getElementById('codeMode').style.display = view === 'code' ? 'block' : 'none';
    document.getElementById('helpMode').style.display = view === 'help' ? 'block' : 'none';
    document.getElementById('previewControls').style.display = view === 'preview' ? 'flex' : 'none';

    // Hide the iframe when not in preview mode
    const previewIframe = document.getElementById('previewIframe');
    previewIframe.style.display = view === 'preview' ? 'block' : 'none';

    if (view === 'preview') {
        requestAnimationFrame(() => {
            setDevice(currentDevice);
        });
    }

    updatePreview();
}

function updateHelpOutput() {
    const variableName = document.getElementById('helpVariableName').value;
    const format = document.querySelector('input[name="format"]:checked').value;
    const isDynamic = document.getElementById('dynamicValue').checked;

    let output = '';
    if (variableName) {
        const value = isDynamic ? `\${${variableName}}` : variableName;
        const dynamicAttr = isDynamic ? ` th:text="\${${variableName}}"` : '';

        switch (format) {
            case 'strong':
                output = `<strong${dynamicAttr}>${isDynamic ? '' : value}</strong>`;
                break;
            case 'underline':
                output = `<u${dynamicAttr}>${isDynamic ? '' : value}</u>`;
                break;
            case 'both':
                output = `<u> <strong${dynamicAttr}>${isDynamic ? '' : value}</strong> </u>`;
                break;
            default:
                output = `<span${dynamicAttr}>${isDynamic ? '' : value}</span>`;
        }
    }

    document.getElementById('outputText').textContent = output;
}

function copyHelpOutput() {
    const output = document.getElementById('outputText').textContent;
    navigator.clipboard.writeText(output);
    const copyBtn = document.querySelector('.help-copy-btn');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = 'Copy';
    }, 2000);
}

const dimensions = {
    'desktop': { width: '100%', height: '100%' },
    'mobile-portrait': { width: '375px', height: '675px' },  // iPhone SE/5s size
    'mobile-landscape': { width: '568px', height: '320px' },
    'tablet-portrait': { width: '768px', height: '1024px' },
    'tablet-landscape': { width: '1024px', height: '768px' }
};

function setDevice(device) {
    currentDevice = device;
    const frame = document.getElementById('previewMode');
    const iframe = document.getElementById('previewIframe');

    // Reset styles
    frame.className = 'preview-frame';
    frame.style = '';
    iframe.style = '';

    const { width, height } = dimensions[device];
    frame.style.width = width;
    frame.style.height = height;

    if (device !== 'desktop') {
        frame.classList.add('device-frame');
        iframe.style.height = '100%';
        iframe.style.overflowY = 'auto';
        iframe.style.WebkitOverflowScrolling = 'touch';
    } else {
        iframe.style.height = '100%';
        iframe.style.overflowY = 'auto';
    }

    // Update active button
    const deviceButtons = document.querySelectorAll('.device-button');
    deviceButtons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-device') === device);
    });

    // Update scale with a slight delay to ensure proper rendering
    setTimeout(() => {
        updatePreviewScale();
    }, 100);

}


window.addEventListener('resize', () => {
    if (document.getElementById('previewMode').style.display !== 'none') {
        updatePreviewScale();
    }
});


function copyCode() {
    const code = document.getElementById('codePreview').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const copyBtn = document.querySelector('.copy-button');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy Code';
        }, 2000);
    });
}


function calculatePreviewScale(containerWidth, containerHeight, frameWidth, frameHeight) {
    const horizontalPadding = 40;
    const verticalPadding = 40;
    const availableWidth = containerWidth - horizontalPadding;
    const availableHeight = containerHeight - verticalPadding;
    return Math.min(availableWidth / frameWidth, availableHeight / frameHeight, 1);
}

function updatePreviewScale() {
    const frame = document.getElementById('previewMode');
    const container = document.querySelector('.preview-container');

    if (currentDevice === 'desktop') {
        frame.style.transform = '';
        return;
    }

    const containerRect = container.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();

    const padding = 48;
    const availableWidth = containerRect.width - padding;
    const availableHeight = containerRect.height - padding;

    const scaleX = availableWidth / frameRect.width;
    const scaleY = availableHeight / frameRect.height;
    currentScale = Math.min(scaleX, scaleY, 0.95);

    frame.style.transform = '';
}

function addField() {
    const fieldType = document.getElementById('fieldType').value;
    const contentFieldsDiv = document.getElementById('contentFields');
    const fieldId = `field-${Date.now()}`; // Create unique ID for the field

    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'field-group';

    if (fieldType === 'text') {
        fieldGroup.innerHTML = `
    <label>Text Content:</label>
    <textarea class="contentText" oninput="validateForm(); updatePreview();" placeholder="Enter text"></textarea>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
        <select class="alignmentSelect" style="width: 30%" onchange="updatePreview()">
            <option value="center">Center</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
        </select>
        <button type="button" class="remove-btn" onclick="removeField(this)">Remove</button>
    </div>`;
    } else if (fieldType === 'button') {
        fieldGroup.innerHTML = `
    <label for="buttonText">Button Text:</label>
    <input type="text" class="buttonText" oninput="validateForm(); updatePreview();" placeholder="Enter Button Name">
    <label for="buttonLink">Button Link:</label>
    <input type="text" class="buttonLink" oninput="validateForm(); updatePreview();" placeholder="Enter Button Link">
    <div style="display: flex; justify-content: end; align-items: center; margin-top: 10px;">
        <button type="button" class="remove-btn" onclick="removeField(this)">Remove</button>
    </div>`;
    }

    contentFieldsDiv.appendChild(fieldGroup);
    contentFields.push(fieldGroup);
    validateForm();
    updatePreview();
}


function removeField(button) {
    const fieldGroup = button.closest('.field-group');
    const contentFieldsDiv = document.getElementById('contentFields');

    if (fieldGroup && contentFieldsDiv) {
        contentFieldsDiv.removeChild(fieldGroup);
        const index = contentFields.indexOf(fieldGroup);
        if (index > -1) {
            contentFields.splice(index, 1);
        }
        validateForm();
        updatePreview();
    }
}


function updatePreview() {
    validateForm();
    const fileName = document.getElementById('fileName').value;
    const imageName = document.getElementById('imageName').value;
    const imageWidth = document.getElementById('imageWidth').value;
    const imageHeight = document.getElementById('imageHeight').value;
    const contactInfo = document.getElementById('contactInfo').checked;
    const scheduleMeeting = document.getElementById('scheduleMeeting').checked;
    const includeFooter = document.getElementById('includeFooter').checked;
    const squirrelType = document.getElementById('squirrelType').value;

    const orgName = squirrelType === 'med' ? 'MedSquirrels' : 'Global Squirrels';
    const orgEmail = squirrelType === 'med' ? 'support@medsquirrels.com' : 'support@globalsquirrels.com';
    const orgWebsite = squirrelType === 'med' ? 'https://medsquirrels.com' : 'https://globalsquirrels.com';
    const s3Path = squirrelType === 'med' ? 'medsquirrels' : 'globalsquirrels';
    const footerLogo = squirrelType ===  'med' ? 'ms_image_0048.png' : 'gs_image_0044.png';
    const imagePrefix = squirrelType === 'med' ? 'ms_image_' : 'gs_image_';

    let contentHTML = '';

    // Generate content from dynamic fields
    contentFields.forEach(fieldGroup => {
        if (fieldGroup.querySelector('.contentText')) {
            const text = fieldGroup.querySelector('.contentText').value;
            const alignmentSelect = fieldGroup.querySelector('.alignmentSelect');
            const alignment = alignmentSelect ? alignmentSelect.value : 'center';
            contentHTML += `<tr><td style="font-size: 16px; line-height: 2; padding-bottom: 15px; text-align: ${alignment};">${text}</td></tr>`;
        } else if (fieldGroup.querySelector('.buttonText')) {
            const buttonText = fieldGroup.querySelector('.buttonText').value;
            const buttonLink = fieldGroup.querySelector('.buttonLink').value;
            contentHTML += `
        <tr>
            <td align="center" style="padding-bottom: 20px;">
                <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center" style="border-radius: 20px; background-color: #1f3462;">
                            <a th:href="\${${buttonLink}}"  target="_blank" style="display: inline-block; background-color: #1f3462; color: #ffffff; padding: 10px 30px; text-decoration: none; border-radius: 20px; font-size: 16px;">${buttonText}</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`;
        }
    });

    // Generate the full template
    const template = `
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${orgName} Email</title>
<style type="text/css">
body,
table,
td,
a {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
}

table,
td {
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
}

img {
    -ms-interpolation-mode: bicubic;
}

img {
    border: 0;
    height: auto;
    line-height: 100%;
    outline: none;
    text-decoration: none;
}

a img {
    border: none;
}

.button a {
    text-decoration: none;
}

@media screen and (max-width: 600px) {
    .container {
        width: 100% !important;
    }

    .mobile-center {
        text-align: center !important;
    }

    .mobile-full-width {
        width: 100% !important;
        max-width: 100% !important;
    }
}
</style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
<tr>
    <td align="center" style="padding: 15px;" bgcolor="#ffffff">
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="border-radius: 20px; border: 1px solid #1f3462; overflow: hidden;">
            <tr>
                <td align="center" bgcolor="#e5f3ff" style="padding-top: 20px; border-radius: 20px 20px 0 0; overflow: hidden;">
                    <a href="javascript:void(0);" style="text-decoration: none; cursor: default !important;" onclick="return false;">
                        <div style="background-image: url('https://globalmedsquirrels.s3.ap-south-1.amazonaws.com/notification-config/images/${s3Path}/${imagePrefix}${imageName}.png'); background-size: contain; background-repeat: no-repeat; background-position: center; width: ${imageWidth}px; height: ${imageHeight}px;"></div>
                    </a>
                </td>
            </tr>
            <tr>
                <td style="padding: 30px; text-align: center; color: #1f3462;" bgcolor="#ffffff">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
            ${contentHTML}
            ${contactInfo ? `<tr><td style="font-size: 16px; line-height: 2; padding-bottom: 15px;">If you have any questions or need assistance, please don't hesitate to contact us at <a href="mailto:${orgEmail}">${orgEmail}</a></td></tr>` : ''}
            ${(contactInfo && scheduleMeeting) ? ` <tr>
                            <td style="font-size: 16px; line-height: 2; padding-bottom: 15px;">
                                or
                            </td>
                        </tr>` : ''}
            ${scheduleMeeting ? `<tr><td align="center"><table border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="border-radius: 20px; background-color: #1f3462;"><a th:href="\${demoLink}" target="_blank" style="display: inline-block; background-color: #1f3462; color: #ffffff; padding: 10px 30px; text-decoration: none; border-radius: 20px; font-size: 16px;">Schedule a Meeting</a></td></tr></table></td></tr>` : ''}
             </table>
                </td>
            </tr>
        </table>
         ${includeFooter ? `<table border="0" cellpadding="0" cellspacing="0" width="600" class="container">
            <tr>
                <td bgcolor="#ffffff" align="center" style="padding: 20px; color: #1f3462;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center" style="font-size: 14px; line-height: 2;">
                                Best Regards
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="font-size: 14px; line-height: 2;">
                                ${orgName} Support Team
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding-top: 15px;">
                                <a href="${orgWebsite}" target="_blank">
                                    <img src="https://globalmedsquirrels.s3.ap-south-1.amazonaws.com/notification-config/images/${s3Path}/${footerLogo}"
                                         alt="${orgName} Logo" width="116"
                                        style="height: 50px; max-width: 116px;" />
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>` : ''}
    </td>
</tr>
</table>   </bo

dy></html>`;

    // Update the preview iframe
    const previewIframe = document.getElementById('previewIframe');
    previewIframe.srcdoc = template;

    // Update the code preview
    const codePreview = document.getElementById('codePreview');
    codePreview.textContent = template;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('helpVariableName').addEventListener('input', updateHelpOutput);
    document.getElementById('dynamicValue').addEventListener('change', updateHelpOutput);
    document.querySelectorAll('input[name="format"]').forEach(radio => {
        radio.addEventListener('change', updateHelpOutput);
    });

    const requiredFields = ['fileName', 'imageName', 'imageWidth', 'imageHeight'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('input', () => {
            validateForm();
            updatePreview();
        });
    });

    setView('preview');
    setDevice('desktop');
    updatePreview();
    validateForm();
});

function downloadTemplate() {
    if (!validateForm()) {
        return;
    }

    const fileName = document.getElementById('fileName').value;
    const template = document.getElementById('previewIframe').srcdoc;

    const blob = new Blob([template], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function markInvalidFields(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (value === '') {
        field.style.borderColor = '#ef4444';
    } else {
        field.style.borderColor = '#e5e7eb';
        field.style.backgroundColor = '#ffffff';
    }
}

// Add this function to validate the form
function validateForm() {
    const fileName = document.getElementById('fileName').value.trim();
    const imageName = document.getElementById('imageName').value.trim();
    const imageWidth = document.getElementById('imageWidth').value.trim();
    const imageHeight = document.getElementById('imageHeight').value.trim();

    const downloadButton = document.querySelector('button[onclick="downloadTemplate()"]');

    let isValid = fileName !== '' &&
        imageName !== '' &&
        imageWidth !== '' &&
        imageHeight !== '';

    markInvalidFields('fileName', fileName);
    markInvalidFields('imageName', imageName);
    markInvalidFields('imageWidth', imageWidth);
    markInvalidFields('imageHeight', imageHeight);

    const contentFieldsDiv = document.getElementById('contentFields');
    const fieldGroups = contentFieldsDiv.getElementsByClassName('field-group');

    Array.from(fieldGroups).forEach(fieldGroup => {
        const textArea = fieldGroup.querySelector('.contentText');
        if (textArea) {
            const isTextValid = textArea.value.trim() !== '';
            markDynamicField(textArea, isTextValid);
            isValid = isValid && isTextValid;
        }

        const buttonText = fieldGroup.querySelector('.buttonText');
        const buttonLink = fieldGroup.querySelector('.buttonLink');
        if (buttonText && buttonLink) {
            const isButtonTextValid = buttonText.value.trim() !== '';
            const isButtonLinkValid = buttonLink.value.trim() !== '';
            markDynamicField(buttonText, isButtonTextValid);
            markDynamicField(buttonLink, isButtonLinkValid);
            isValid = isValid && isButtonTextValid && isButtonLinkValid;
        }
    });

    downloadButton.disabled = !isValid;
    downloadButton.style.opacity = isValid ? '1' : '0.5';
    downloadButton.style.cursor = isValid ? 'pointer' : 'not-allowed';

    return isValid;
}

function markDynamicField(field, isValid) {
    if (!isValid) {
        field.style.borderColor = '#ef4444';
        field.style.backgroundColor = '#fef2f2';
    } else {
        field.style.borderColor = '#e5e7eb';
        field.style.backgroundColor = '#ffffff';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setView('preview');
    setDevice('desktop');
    updatePreview();
});
