<link rel="stylesheet" href="./color.css">

<form action="index.php" method="POST" enctype="multipart/form-data">
    <div>
        <label>
            File: <input id="file" type="file" accept=".csv" name="file" onchange="resetLoadFileButton()">
        </label>
    </div>
    <div>
        <label>
            <input id="force_serialize" type="checkbox" name="force_serialize"> Is Force Serialize?
        </label>
    </div>
    <div>
        <button id="file-open" type="submit" value="open">Open file</button>
    </div>
</form>

<form action="savefile.php" method="POST" enctype="multipart/form-data">
    <?php
    if (isset($_FILES["file"])) {
        $serialized_pattern = "/^a:\d+:{/";
        $file_path = $_FILES['file']['tmp_name'];
        try {
            $file = fopen($file_path, "r+");
            $fields = fgetcsv($file);
            $id_idx = array_search("id", $fields, true);

            echo "<label for='filename'>File name</label>";
            echo "<input name='filename' value='" . htmlentities($_FILES['file']['name'], ENT_QUOTES) . "' required>";
            echo "<button type='submit' value='save'>Save file</button>";

            echo "<div id='fields' style='display: none;'>";
            foreach ($fields as $key => $keyName) {
                echo "<input name='keys[{$key}]' value='" . htmlentities($keyName, ENT_QUOTES) . "' required>";
            }
            echo "</div>";

            echo "<div><button type='button' onclick='createRecord()'>Add new record</div>";

            echo "<div id='records'>";
            $iter = 0;
            for ($iter; !feof($file); ++$iter) {
                // input name will be record[iterator][keyname]
                $name = "record[{$iter}]";
                $record = fgetcsv($file);
                // empty line
                if (empty($record)) {
                    break;
                }
                echo "<div class='csv-data' data-id='{$iter}'>";
                for ($i = 0; $i < count($record); ++$i) {
                    $recordName = "{$name}[{$fields[$i]}]";
                    $current = $record[$i];
                    if (isset($_POST['force_serialize']) and $fields[$i] == 'name') {
                        $serialized = serialize(['zh' => $current]);
                        $current = $serialized;
                    }
                    echo "<strong>$fields[$i]: </strong>";
                    if (preg_match($serialized_pattern, $current)) {
                        $data = unserialize($current);
                        echo "<div class='unserialized' data-serialize='$fields[$i]'>";
                        $j = 0;
                        foreach ($data as $key => $value) {
                            echo "<section>";
                            echo "<label>Key: </label>";
                            echo "<input name='{$recordName}[{$j}][key]' onkeyup='validateUnserializedFields(event)' value='" . htmlentities($key, ENT_QUOTES) . "' required>";
                            echo "<label>Value: </label>";
                            echo "<input name='{$recordName}[{$j}][value]' onkeyup='validateUnserializedFields(event)' value='" . htmlentities($value, ENT_QUOTES) . "' required>";
                            echo "<button type='button' onclick='removeItem(event)'>Remove</button>";
                            echo "</section>";
                            ++$j;
                        }
                        echo "</div>";
                        // add new button
                        echo
                            "<div>
                                <button id='newArrField' type='button' onclick='addItemField(event)'>Add new</button>
                            </div>";
                    } else {
                        echo "<input name='{$recordName}' value='" . htmlentities($current, ENT_QUOTES) . "' required>";
                        echo "<br/>";
                    }
                }
                echo "</div>";
            }
            echo "</div>";
            fclose($file);

            if ($iter) {
                echo "<div><button type='button' onclick='createRecord()'>Add new record</div>";
            }
        } catch (Exception $e) {
            echo "<div class='error'>{$e->getMessage()}</div>";
        }
    }
    ?>
</form>

<script>
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

    const loadFileButton = document.getElementById("file-open");
    const file = document.getElementById("file");

    resetLoadFileButton();
</script>

<style>
    html {
        line-height: 1.5rem;
    }

    span[role="textbox"] {
        display: inline-block;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 1px 6px;
        min-width: 1ch;
        margin: 0 8px;
    }

    .csv-data {
        border: 2px solid red;
        margin: 8px;
        padding: 8px;
    }

    .csv-data>.unserialized {
        margin-left: 8px;
    }
</style>