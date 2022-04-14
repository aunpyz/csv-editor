{extends 'layouts/default.tpl'}
{block 'css'}
    <link rel='stylesheet' href='color.css'>
{/block}
{block 'main'}
	<div class='error'>{$error->getMessage()}</div>
{/block}