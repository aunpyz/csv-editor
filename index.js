const resetLoadFileButton = () => loadFileButton.disabled = !file.value;
const validateUnserializedFields = ({
    target
}) => {
    const button = target.parentNode.parentNode.nextSibling.querySelector('button');
    const fields = [...target.parentNode.parentNode.getElementsByTagName('input')].filter(el => !el.value);
    if (fields.length) {
        button.disabled = true;
    } else {
        button.disabled = false;
    }
}
const removeItem = ({
    target
}) => target.parentNode.remove();
const addItemField = ({
    target
}) => {
    const sibling = target.parentNode.previousSibling;
    const currentLastChild = sibling.lastChild;
    const [name, item] = [currentLastChild.dataset.name, parseInt(currentLastChild.dataset.item) + 1];
    const newName = `${name}[${item}]`;
    const section = newElement("section", null, [
        {key: 'data-name', value: name},
        {key: 'data-item', value: item}
    ]);
    section.appendChild(newElement("label", "Key: "));
    section.appendChild(newElement("input", null, [{
            key: 'name',
            value: `${newName}[key]`
        },
        {
            key: 'onkeyup',
            value: 'validateUnserializedFields(event)'
        }
    ]));
    section.appendChild(newElement("label", "Value: "));
    section.appendChild(newElement("input", null, [{
            key: 'name',
            value: `${newName}[value]`
        },
        {
            key: 'onkeyup',
            value: 'validateUnserializedFields(event)'
        }
    ]));
    section.appendChild(newElement("button", "Remove", [{
        key: "onclick",
        value: "removeItem(event)"
    }]));

    sibling.appendChild(section);
    target.disabled = true;
};
const newElement = (type, text, attributes) => {
    elm = document.createElement(type);
    if (text) {
        elm.textContent = text;
    }
    if (attributes) {
        attributes.forEach(({
            key,
            value
        }) => {
            elm.setAttribute(key, value);
        })
    }

    return elm;
}
const createRecord = () => {
    if (document.querySelector("#records .csv-data")) {
        const lastRecord = document.querySelector("#records").lastChild;
        const newRecordId = parseInt(lastRecord.dataset.id) + 1;
        let newRecord = lastRecord.cloneNode(true);
        let addArrFieldButton = newRecord.querySelector(".newArrField")
        if (addArrFieldButton) {
            // only exist on array type field
            addArrFieldButton.disabled = true;
        }
        newRecord.dataset.id = newRecordId;
        newRecord.querySelector("input[name$='[id]']").value = newRecordId + 1;
        newRecord.querySelectorAll("input[name$='[key]'").forEach(i => i.value = i.value);
        newRecord.querySelectorAll("input").forEach(input => {
            input.removeAttribute("value");
            input.name = input.name.replace(/record\[\d+\]/, `record[${newRecordId}]`);
        });
        document.getElementById("records").appendChild(newRecord);
        newRecord.querySelector("input").focus();
    } else {
        const fieldsContainer = document.querySelector("#fields tbody");
        const record = newElement("div", null, [{
                key: 'class',
                value: 'csv-data'
            },
            {
                key: 'data-id',
                value: 0
            }
        ]);
        fieldsContainer.querySelectorAll("tr td:first-of-type input")
            .forEach(field => {
                const div = newElement("div");
                const strong = newElement("strong", `${field.value}: `)
                const input = newElement("input", null, [{
                    key: 'name',
                    value: `record[0][${field.value}]`
                }]);

                div.appendChild(strong);
                div.appendChild(input);

                record.appendChild(div);
            });
        document.getElementById("records").appendChild(record)
            .parentNode
            .parentNode
            .appendChild(newElement("button", "Add new record", [{
                    key: 'type',
                    value: 'button'
                },
                {
                    key: 'onclick',
                    value: 'createRecord()'
                }
            ]));
        const idInput = record.querySelector("input");
        idInput.value = 1;
        idInput.focus();
    }
}
const newField = () => {
    const tbody = document.querySelector(".fields-manipulator table tbody");
    const tr = tbody.lastChild.cloneNode(true);
    const namedInput = tr.querySelector("input[name]");
    const checkbox = tr.querySelector("input[type='checkbox']");
    namedInput.name = namedInput.name.replace(/\d+/, parseInt(namedInput.name.match(/\d+/)[0]) + 1);
    namedInput.value = "";
    checkbox.dataset.nth = parseInt(checkbox.dataset.nth) + 1;
    checkbox.checked = false;
    tr.querySelectorAll("input").forEach(input => input.removeAttribute("value"));
    tbody.appendChild(tr);

    document.querySelectorAll(".csv-data").forEach((csv, i) => {
        const lastInputName = csv.querySelector("input:last-of-type").name;
        const fieldName = lastInputName.match(/\[[\w\s]+\]$/);
        const div = newElement("div");

        div.appendChild(newElement("strong", "[no name]: "));
        const input = newElement("input", null, [
            {key: 'name', value: `${lastInputName.substr(0, fieldName.index)}[no name]`}
        ]);
        div.appendChild(input);

        csv.appendChild(div);
    });

    tr.querySelector("input").focus();
}
const changeFieldName = ({target}) => {
    const nthOfType = parseInt(target.name.match(/\d+/)[0]) + 1;
    const nameToApply = target.value ? target.value : 'no name';
    document.querySelectorAll(`.csv-data > div:nth-of-type(${nthOfType}) strong`)
        .forEach(strong => {
            const nextSibling = strong.nextSibling;
            strong.textContent = target.value ? `${nameToApply}: ` : `[${nameToApply}]: `
            if (nextSibling.tagName.toUpperCase() === "INPUT") {
                nextSibling.name = nextSibling.name
                    .replace(/\[[\w\s]+\]$/, `[${nameToApply}]`);
            } else {
                // serialized field
                const regex = /^(record\[\d+\])\[[\w\s]+\]/;
                nextSibling.querySelectorAll("section").forEach(section => {
                    section.dataset.name = section.dataset.name
                        .replace(regex, `$1[${nameToApply}]`)
                    section.querySelectorAll("input").forEach(input => {
                        input.name = input.name
                            .replace(regex, `$1[${nameToApply}]`);
                    });
                });
            }
        });
}
const toggleFieldType = ({target}) => {
    document.querySelectorAll(`.csv-data > div:nth-of-type(${target.dataset.nth})`).forEach((field, i) => {
        const data = field.querySelector(":nth-child(2)")
        if (data.tagName.toUpperCase() === "INPUT") {
            // init serialize type input
            const dataVal = data.value;
            const name = target
                    .parentNode
                    .parentNode
                    .querySelector("td:first-of-type input:first-of-type")
                    .value;
            const div = newElement("div", null, [
                {key: 'class', value: 'unserialized'}
            ]);
            const addButtonDiv = newElement("div");
            const section = newElement("secion", null, [
                {key: 'data-name', value: `record[0][${name}]`},
                {key: 'data-item', value: 0}
            ])
            const keyInput = newElement("input", null, [
                {key: 'name', value: `record[0][${name}][0][key]`},
                {key: 'onkeyup', value: 'validateUnserializedFields(event)'},
            ]);
            const valueInput = newElement("input", null, [
                {key: 'name', value: `record[0][${name}][0][value]`},
                {key: 'onkeyup', value: 'validateUnserializedFields(event)'}
            ]);
            const addButton = newElement("button", "Add new", [
                {key: 'type', value: 'button'},
                {key: 'class', value: 'newArrField'},
                {key: 'onclick', value: 'addItemField(event)'},
            ]);
            valueInput.value = dataVal;
            addButton.disabled = true;

            section.appendChild(newElement("label", "Key: "));
            section.appendChild(keyInput);
            section.appendChild(newElement("label", "Value: "));
            section.appendChild(valueInput);
            section.appendChild(newElement("button", "Remove", [
                {key: 'type', value: 'button'},
                {key: 'onclick', value: 'removeItem(event)'},
            ]))
            div.appendChild(section);
            addButtonDiv.appendChild(addButton);
            data.parentNode
                .insertBefore(div, data)
                .parentNode
                .insertBefore(addButtonDiv, data);
            
            // only focus the first key input
            if (!i) {
                keyInput.focus();
            }
        } else {
            // serialized field
            // this will only pick the first value input as a value for normal input
            const ref = data.querySelector("section:first-of-type");
            const input = newElement("input", null, [
                {key: 'name', value: ref.dataset.name}
            ]);
            input.value = ref.querySelector("input[name$='[value]']").value;
            data.parentNode.insertBefore(input, data);
            data.nextSibling.remove();
        }
        data.remove();
    });
}
const markFieldType = () => {
    const checkboxes = document.querySelectorAll("tbody tr td:nth-of-type(2) input[type='checkbox']");
    document.querySelectorAll(".csv-data:first-of-type > div").forEach((field, i) => {
        const data = field.querySelector(":nth-child(2)");
        if (data.tagName.toUpperCase() === "DIV") {
            checkboxes[i].checked = true;
        }
    })
}

const loadFileButton = document.getElementById("file-open");
const file = document.getElementById("file");

resetLoadFileButton();
markFieldType();