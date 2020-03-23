function checkFeatures()
{
	var checkFileAPI = function()
	{
		return window.File && window.FileReader && window.FileList && window.Blob;
	};
	var checkNotificationsAPI = function()
	{
		return true;
	};
	
	return {
		fileAPI: checkFileAPI(),
		notifications: checkNotificationsAPI()
	};
}