$(function() {
    const $file = $('#file')
    const $loadFileButton = $('#file-open')
    const $fieldsGroup = $('<div></div>').attr({
        'class': 'col-auto row py-1'
    })
    const $fieldGroup = $('<div></div>').attr({
        'class': 'col-auto',
    })

    // utils
    const increment = function(d) {
        return Number(d) + 1
    }

    // functions
    const markFieldType = function() {
        const checkboxes = $(`tbody tr td:nth-of-type(2) input[type='checkbox']`)
        $('.csv-data:first-of-type > div').each(function(i, field) {
            if ($(field).find('.unserialized').length) {
                $(checkboxes[i]).attr('checked', true)
            }
        })
    }
    const resetLoadFileButton = function() {
        $loadFileButton.attr('disabled', !$file.prop('value'))
    }
    const appendFields = function() {
        $('.csv-data').each(function(_i, csv) {
            const lastInputName = $(csv).find('input:last-of-type').prop('name')
            const $div = $('<div></div>').attr({
                'class': 'row my-2 align-items-center'
            })
            const $input = $('<input>').attr({
                'name': lastInputName.replace(/\[[\w\s]+\]$/, '[no name]'),
                'class': 'form-control',
            })
            $div.append(
                $fieldGroup.clone().append(
                    $('<strong>[no name]: </strong>').attr({
                        'class': 'col-form-label',
                    }),
                ),
                $fieldGroup.clone().append(
                    $input,
                ),
            )
            $(csv).append($div)
        })
    }

    // listeners
    $(document).on('input', `#fields input[type='checkbox']`, function(event) {
        const $checkbox = $(event.target)
        if ($checkbox.prop('checked')) {
            $(`.csv-data > div:nth-of-type(${$checkbox.data('nth')})`).each(function(_, div) {
                $(div).children('div:nth-child(2)').each(function(_, vnormal) {
                    const $normal = $(vnormal).find('input')
                    const name = $normal.attr('name').match(/^record\[\d+\]\[([\w\s]+)\]$/)[1]
                    const $div = $('<div></div>').attr({
                        'class': 'unserialized',
                        'data-name': name,
                    })
                    const $section = $('<section></section>').attr({
                        'data-name': $normal.attr('name'),
                        'data-item': 0,
                        'class': 'row align-items-center'
                    }).append(
                        $fieldsGroup.clone().append(
                            $fieldGroup.clone().append(
                                $('<label>Key: </label>').attr({
                                    'class': 'col-form-label'
                                }),
                            ),
                            $fieldGroup.clone().append(
                                $('<input>').attr({
                                    'name': `${$normal.attr('name')}[0][key]`,
                                    'class': 'form-control',
                                })
                            )
                        ),
                        $fieldsGroup.clone().append(
                            $fieldGroup.clone().append(
                                $('<label>Value: </label>').attr({
                                    'class': 'col-form-label'
                                }),
                            ),
                            $fieldGroup.clone().append(
                                $('<input>').attr({
                                    'name': `${$normal.attr('name')}[0][value]`,
                                    'class': 'form-control',
                                }).val($normal.val())
                            )
                        ),
                        $fieldGroup.clone().addClass('py-1').append(
                            $('<button>Remove</button>').attr({
                                'type': 'button',
                                'class': 'btn btn-danger',
                            }),
                        ),
                    )
                    const $buttonDiv = $('<div></div>').attr({
                        'class': 'pt-1',
                    }).append(
                        $('<button>Add new</div>').attr({
                            'type': 'button',
                            'class': 'new-arr-field btn btn-success',
                        }),
                    )
                    $(div).append(
                        $fieldGroup.clone().append(
                            $div.append($section),
                            $buttonDiv,
                        )
                    )
                    $(vnormal).remove()
                })
            }).first()
                .find('.unserialized input:first-of-type')
                .focus()
        }
        else {
            $(`.csv-data > div:nth-of-type(${$checkbox.data('nth')})`).each(function(_, div) {
                $(div).children('div:nth-child(2)').each(function(_, vserialized) {
                    const $serialized = $(vserialized).find('.unserialized')
                    const $ref = $serialized.find('section:first-of-type')
                    const $input = $('<input>')
                        .attr({
                            'name': $ref.data('name'),
                            'class': 'form-control',
                        })
                        .val($ref.find('input[name$="[value]"]').val())
                    $(div).append(
                        $fieldGroup.clone().append($input)
                    )
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
        $(event.target).parent().parent().remove()
    })
    $(document).on('click', '.new-arr-field', function(event) {
        const $sibling = $(event.target).parent().parent().find('div:first-of-type')
        console.log($sibling.data('name'))
        $(`div[data-name='${$sibling.data('name')}']`).each(function(_i, serialized) {
            const $lastChild = $(serialized).find('section:last-child')
            const [name, item] = [$lastChild.data('name'), increment($lastChild.data('item'))]
            const newName = `${name}[${item}]`
            const $section = $('<section></section>').attr({
                'data-name': name,
                'data-item': item,
                'class': 'row align-items-center'
            })
            const $keyInput = $('<input>').attr({
                'name': `${newName}[key]`,
                'class': 'form-control',
            })
            const $valueInput = $('<input>').attr({
                'name': `${newName}[value]`,
                'class': 'form-control',
            })
            $section.append(
                $fieldsGroup.clone().append(
                    $fieldGroup.clone().append(
                        $('<label>Key: </label>').attr({
                            'class': 'col-form-label'
                        }),
                    ),
                    $fieldGroup.clone().append(
                        $keyInput,
                    ),
                ),
                $fieldsGroup.clone().append(
                    $fieldGroup.clone().append(
                        $('<label>Value: </label>').attr({
                            'class': 'col-form-label'
                        }),
                    ),
                    $fieldGroup.clone().append(
                        $valueInput,
                    ),
                ),
                $fieldGroup.clone().addClass('py-1').append(
                    $('<button>Remove</button>').attr({
                        'type': 'button',
                        'class': 'btn btn-danger',
                    }),
                ),
            )
            $(serialized).append($section)
        })
    })
    $('#new-record').on('click', function() {
        // TODO: Fix this function
        $records = $('#records')
        $lastRecord = $records.find('div.csv-data:last-of-type')
        if ($lastRecord.length) {
            const newRecordId = increment($lastRecord.data('id'))
            const $newRecord = $lastRecord.clone()
            $newRecord.attr('data-id', newRecordId)
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
