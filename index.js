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
const toggleFieldType = ({target}) => {
    document.querySelectorAll(`.csv-data > div:nth-of-type(${target.dataset.nth})`).forEach((field, i) => {
        const data = field.querySelector(":nth-child(2)");
        if (data.tagName.toUpperCase() === "INPUT") {
            const recordNo = field.parentNode.dataset.id;
            // init serialize type input
            const dataVal = data.value;
            const name = target
                    .parentNode
                    .parentNode
                    .querySelector("td:first-of-type input:first-of-type")
                    .value;
            const div = newElement("div", null, [
                {key: 'class', value: 'unserialized'},
                {key: 'data-name', value: name}
            ]);
            const addButtonDiv = newElement("div");
            const section = newElement("section", null, [
                {key: 'data-name', value: `record[${recordNo}][${name}]`},
                {key: 'data-item', value: 0}
            ])
            const keyInput = newElement("input", null, [
                {key: 'name', value: `record[${recordNo}][${name}][0][key]`},
            ]);
            const valueInput = newElement("input", null, [
                {key: 'name', value: `record[${recordNo}][${name}][0][value]`}
            ]);
            const addButton = newElement("button", "Add new", [
                {key: 'type', value: 'button'},
                {key: 'class', value: 'newArrField'},
            ]);
            valueInput.value = dataVal;

            section.appendChild(newElement("label", "Key: "));
            section.appendChild(keyInput);
            section.appendChild(newElement("label", "Value: "));
            section.appendChild(valueInput);
            section.appendChild(newElement("button", "Remove", [
                {key: 'type', value: 'button'},
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

$(function() {
    const $file = $('#file')
    const $loadFileButton = $('#file-open')

    // utils
    const increment = function(d) {
        return Number(d) + 1
    }

    // functions
    const markFieldType = function() {
        const checkboxes = $(`tbody tr td:nth-of-type(2) input[type='checkbox']`)
        $('.csv-data:first-of-type > div').each(function(i, field) {
            if ($(field).find('div:nth-child(2)').length) {
                $(checkboxes[i]).attr('checked', true)
            }
        })
    }
    const resetLoadFileButton = function() {
        console.log($file.prop('value'))
        $loadFileButton.attr('disabled', !$file.prop('value'))
    }
    const appendFields = function() {
        $('.csv-data').each(function(_i, csv) {
            const lastInputName = $(csv).find('input:last-of-type').prop('name')
            const $div = $('<div></div>')
            const $input = $('<input>').attr('name', lastInputName.replace(/\[[\w\s]+\]$/, '[no name]'))
            $div.append('<strong>[no name]: </strong>', $input)
            $(csv).append($div)
        })
    }

    // listeners
    $(document).on('keyup', `#fields tr td:first-of-type > input[name^='keys']`, function(event) {
        const $target = $(event.target)
        const nthOfType = increment($target.attr('name').match(/\d+/))
        const newName = $target.val() || 'no name'
        $(`.csv-data > div:nth-of-type(${nthOfType}) strong`).each(function(_, strong) {
            $(strong).text(`${$target.val() || '[no name]'}: `)
            $(strong).next('input').each(function(_, input) {
                const $input = $(input)
                $input.attr('name', $input.attr('name').replace(/\[[\w\s]+\]$/, `[${newName}]`))
            })
            $(strong).next('.unserialized').find('section').each(function(_, section) {
                const regex = /^(record\[\d+\])\[[\w\s]+\]/;
                const $section = $(section)
                $section.attr('data-name', $section.data('name').replace(regex, `$1[${newName}]`))
                $section.find('input').each(function(_, input) {
                    $(input).attr('name', $(input).attr('name').replace(regex, `$1[${newName}]`))
                })
            })
        })
    })
    $(document).on('keyup', '.unserialized input:first-of-type', function(event) {
        const $target = $(event.target)
        const nameWithoutRecordNo = $target.prop('name').split(/(?<=record\[)\d+(?=\])/);
        const value = $target.prop('value')
        $('[data-id]').each(function(_i, record) {
            $(record).find(`[name='${nameWithoutRecordNo.join($(record).data('id'))}']`).val(value)
        })
    })
    $(document).on('click', '.fields-manipulator>button', function() {
        const $tbody = $('.fields-manipulator tbody')
        const $tr = $tbody.find('tr:last-of-type').clone()
        const $namedInput = $tr.find('input[name]')
        const $checkbox = $tr.find(`input[type='checkbox']`)
        $namedInput
            .prop('value', '')
            .attr('name', $namedInput.prop('name').replace(/\d+/, increment))
        $checkbox
            .prop('checked', false)
            .attr('data-nth', increment($checkbox.data('nth')))
        $tr.find('input').each(function(_i, input) { $(input).removeAttr('value') })
        $tbody.append($tr)
        $tr.find('input').first().focus()
        appendFields()
    })
    $(document).on('click', '.unserialized button', function(event) {
        $(event.target).parent().remove()
    })
    $(document).on('click', '.new-arr-field', function(event) {
        const $sibling = $(event.target).parent().parent().find('div:first-of-type')
        $(`div[data-name='${$sibling.data('name')}']`).each(function(_i, serialized) {
            const $lastChild = $(serialized).find('section:last-child')
            const [name, item] = [$lastChild.data('name'), increment($lastChild.data('item'))]
            const newName = `${name}[${item}]`
            const $section = $('<section></section>').attr({
                'data-name': name,
                'data-item': item,
            })
            const $keyInput = $('<input>').attr('name', `${newName}[key]`)
            const $valueInput = $('<input>').attr('name', `${newName}[value]`)
            $section.append(
                '<label>Key: </label>',
                $keyInput,
                '<label>Value: </label>',
                $valueInput,
                $('<button>Remove</button>').prop('type', 'button'),
            )
            $(serialized).append($section)
        })
    })
    $('#new-record').on('click', function() {
        $records = $('#records')
        $lastRecord = $records.find('div.csv-data:last-of-type')
        if ($lastRecord.length) {
            console.log($lastRecord)
            const newRecordId = increment($lastRecord.data('id'))
            console.log(newRecordId)
            const $newRecord = $lastRecord.clone()
            $newRecord.attr('data-id', newRecordId)
            $newRecord.find('.new-arr-field').prop('disabled', true)
            $newRecord.find(`input:not([name$='[id]'],[name$='[key]'])`).each(function(_i, input) {
                $(input).prop('value', '')
            })
            $newRecord.find('input').each(function(_i, input) {
                $(input).attr('name', $(input).attr('name').replace(/(?<=record\[)\d+(?=\])/, newRecordId))
            })
            $newRecord.find('div.unserialized>section').each(function(_i, section) {
                $(section).attr('data-name', $(section).data('name').replace(/(?<=record\[)\d+(?=\])/, newRecordId))
            })
            $newRecord.find(`input[name$='[id]'`).prop('value', increment(newRecordId))
            $records.append($newRecord)
            $newRecord.find('input').first().focus()
        }
        else {
            const $fieldsContainer = $('#fields tbody')
            const $record = $('<div></div>').attr({
                'class': 'csv-data',
                'data-id': 0,
            })
            $fieldsContainer.find('tr td:first-of-type input').each(function(_i, field) {
                $record.append(
                    $('<div></div>').append(
                        `<strong>${$(field).val()}: </strong>`,
                        $('<input>').attr('name', `record[0][${$(field).val()}]`),
                    )
                )
            })
            $('#records').append($record)
            $record.find(`input[name$='[id]'`).val(1).focus()
        }
    })
    $file.on('change', resetLoadFileButton)

    // initializes
    markFieldType()
    resetLoadFileButton()
})
