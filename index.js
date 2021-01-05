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
    const section = newElement("section");
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

    section.querySelectorAll("input").forEach(input => input.required = true);
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
        let addArrFieldButton = newRecord.querySelector("#newArrField")
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
        const fieldsContainer = document.querySelector("#fields");
        const record = newElement("div", null, [{
                key: 'class',
                value: 'csv-data'
            },
            {
                key: 'data-id',
                value: 0
            }
        ]);
        fieldsContainer.querySelectorAll("input")
            .forEach(field => {
                const div = newElement("div");
                const strong = newElement("strong", `${field.value}: `)
                const input = newElement("input", null, [{
                    key: 'name',
                    value: `record[0][${field.value}]`
                }]);
                input.required = true;

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
    namedInput.name = namedInput.name.replace(/\d+/, parseInt(namedInput.name.match(/\d+/)[0]) + 1);
    tr.querySelectorAll("input").forEach(input => input.removeAttribute("value"));
    tbody.appendChild(tr);
}
const changeFieldName = ({target}) => {
    nthOfType = parseInt(target.name.match(/\d+/)[0]) + 1;
    document.querySelectorAll(`.csv-data strong:nth-of-type(${nthOfType})`).forEach(strong => strong.textContent = `${target.value}: `);
}

const loadFileButton = document.getElementById("file-open");
const file = document.getElementById("file");

resetLoadFileButton();