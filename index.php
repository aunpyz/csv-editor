<form action="index.php" method="POST" enctype="multipart/form-data">
    <input id="file" name="file" type="file" accept=".csv" onchange="resetLoadFileButton()">
    <input id="file-open" type="submit" value="Open file">
</form>

<?php
    if (isset($_FILES['file'])) {
        $serialized_pattern = "/^a:\d+:{/";
        $file_path = $_FILES['file']['tmp_name'];
        try {
            $file = fopen($file_path, "r+");
            $fields = fgetcsv($file);
            $id_idx = array_search("id", $fields, true);

            echo "<label for='filename'>File name</label>";
            echo "<input id='filename' value='{$_FILES['file']['name']}'>";
            while(!feof($file)) {
                $record = fgetcsv($file);
                // empty line
                if (empty($record)) {
                    break;
                }
                echo "<div class='csv-data' data-id='{$record[$id_idx]}'>";
                for($i = 0; $i < count($record); ++$i) {
                    $current = $record[$i];
                    echo "<strong>$fields[$i]: </strong>";
                    if (preg_match($serialized_pattern, $current)) {
                        $data = unserialize($current);
                        echo "<div class='unserialized' data-serialize='$fields[$i]'>";
                        foreach ($data as $key => $value) {
                            echo "<section>";
                            echo "<label>Key: </label>";
                            echo "<input data-key='key' onkeyup='validateUnserializedFields(event)' value='{$key}'>";
                            echo "<label>Value: </label>";
                            echo "<input data-key='value' onkeyup='validateUnserializedFields(event)' value='{$value}'>";
                            echo "<button onclick='removeItem(event)'>Remove</button>";
                            echo "</section>";
                        }
                        echo "</div>";
                        // add new button
                        echo
                        "<div>
                            <button onclick='addItemField(event)'>Add new</button>
                        </div>";
                    } else {
                        echo "<input value='{$current}'>";
                        echo "<br/>";
                    }
                }
                echo "</div>";
            }
            fclose($file);
        } catch (Exception $e) {
            echo "<div class='error'>{$e->getMessage()}</div>";
        }
    }
?>

<script>
    const resetLoadFileButton = () => loadFileButton.disabled = !file.value;
    const validateUnserializedFields = ({target}) => {
        const button = target.parentNode.parentNode.nextSibling.querySelector('button');
        const fields = [...target.parentNode.parentNode.getElementsByTagName('input')].filter(el => !el.value);
        if (fields.length) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    }
    const removeItem = ({target}) => target.parentNode.remove();
    const addItemField = ({target}) => {
        const sibling = target.parentNode.previousSibling;
        const section = document.createElement("section");
        section.appendChild(newElement("label", "Key: "));
        section.appendChild(newElement("input", undefined, [
            {key: 'data-key', value: 'key'},
            {key: 'onkeyup', value: 'validateUnserializedFields(event)'}
        ]));
        section.appendChild(newElement("label", "Value: "));
        section.appendChild(newElement("input", undefined, [
            {key: 'data-key', value: 'value'},
            {key: 'onkeyup', value: 'validateUnserializedFields(event)'}
        ]));
        section.appendChild(newElement("button", "Remove", [
            {key: "onclick", value: "removeItem(event)"}
        ]));

        sibling.appendChild(section);
        target.disabled = true;
    };
    const newElement = (type, text, attributes) => {
        elm = document.createElement(type);
        if (text) {
            elm.innerHTML = text;
        }
        if (attributes) {
            attributes.forEach(({key, value}) => {
                elm.setAttribute(key, value);
            })
        }

        return elm;
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
    .csv-data > .unserialized {
        margin-left: 8px;
    }
    .error {
        color: red;
    }
</style>