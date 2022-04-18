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
    $(document).on('input', `#fields input[type='checkbox']`, function(event) {
        const $checkbox = $(event.target)
        if ($checkbox.prop('checked')) {
            $(`.csv-data > div:nth-of-type(${$checkbox.data('nth')})`).each(function(_, div) {
                $(div).children('input:nth-child(2)').each(function(_, normal) {
                    const name = $(normal).attr('name').match(/^record\[\d+\]\[([\w\s]+)\]$/)[1]
                    const $div = $('<div></div>').attr({
                        'class': 'unserialized',
                        'data-name': name,
                    })
                    const $section = $('<section></section>').attr({
                        'data-name': $(normal).attr('name'),
                        'data-item': 0,
                    })
                        .append(
                            '<label>Key: </label>',
                            $('<input>').attr('name', `${$(normal).attr('name')}[0][key]`),
                            '<label>Value: </label>',
                            $('<input>')
                                .attr('name', `${$(normal).attr('name')}[0][value]`)
                                .val($(normal).val()),
                            $('<button>Remove</button>').attr('type', 'button'),
                        )
                    const $buttonDiv = $('<div></div>')
                        .append($('<button>Add new</div>').attr({
                            'type': 'button',
                            'class': 'new-arr-field',
                        }))
                    $(div).append($div.append($section), $buttonDiv)
                    $(normal).remove()
                })
            }).first()
                .find('.unserialized input:first-of-type')
                .focus()
        }
        else {
            $(`.csv-data > div:nth-of-type(${$checkbox.data('nth')})`).each(function(_, div) {
                $(div).children('div:nth-child(2)').each(function(_, serialized) {
                    const $serialized = $(serialized)
                    const $ref = $serialized.find('section:first-of-type')
                    const $input = $('<input>')
                        .attr('name', $ref.data('name'))
                        .val($ref.find('input:last-of-type').val())
                    $(div).append($input)
                    $serialized.next().remove()
                }).remove()
            })
        }
    })
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
