{extends 'layouts/default.tpl'}
{block 'main'}
	<div class='container my-4 text-danger-emphasis'>{$error->getMessage()}</div>
{/block}