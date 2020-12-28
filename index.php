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
                            echo "<span data-key='key' role='textbox' contenteditable>{$key}</span>";
                            echo "<label>Value: </label>";
                            echo "<span data-key='value' role='textbox' contenteditable>{$value}</span>";
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
                        echo "<span role='textbox' contenteditable>{$current}</span>";
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
    const removeItem = ({target}) => target.parentNode.remove();
    const addItemField = ({target}) => {
        const sibling = target.parentNode.previousSibling;
        const section = document.createElement("section");
        section.appendChild(newElement("label", "Key: "));
        section.appendChild(newElement("span", undefined, [
            {key: 'data-key', value: 'key'},
            {key: 'role', value: 'textbox'},
            {key: 'contenteditable', value: 'true'}
        ]));
        section.appendChild(newElement("label", "Value: "));
        section.appendChild(newElement("span", undefined, [
            {key: 'data-key', value: 'value'},
            {key: 'role', value: 'textbox'},
            {key: 'contenteditable', value: 'true'}
        ]));
        section.appendChild(newElement("button", "Remove", [
            {key: "onclick", value: "removeItem(event)"}
        ]));

        sibling.appendChild(section);
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