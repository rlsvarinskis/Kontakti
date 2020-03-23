var DynamicElementList = function(element, emptyFunction, moreFunction, addFirstElementFunction, equalFunction, distanceFunction, withinFunction, createFunction, showFunction, quickShowFunction, removeFunction, updateFunction)
{
	this.list = []; //The list
	
	this.functions = {
		addFE: addFirstElementFunction,
		equals: equalFunction,
		distance: distanceFunction,
		within: withinFunction,
		create: createFunction,
		show: showFunction,
		quickShow: quickShowFunction,
		remove: removeFunction,
		update: updateFunction
	};
	
	this.deleteThis = function()
	{
		for (var i = 0; i < this.list.length; i++)
			this.functions.remove(this.list[i]);
		delete this.list;
		
		for (var name in this.functions)
			delete this.functions[name];
		
		delete this.functions;
		delete this.showEmpty;
		delete this.hideEmpty;
		
		delete this.element;
	}
	
	this.element = element;
	this.showEmpty = emptyFunction;
	this.hideEmpty = moreFunction;
}

//Updates the buttons and objects using the retrieved data
DynamicElementList.prototype.retrieved = function(from, to, arr, limit, idvar)
{
	if (arr.length == limit)
	{
		if (to == 0)
			this.hideEmpty();
		to = arr[limit - 1][idvar];
	} else if (to == 0)
		this.showEmpty();
	this.displayObjects(arr, from, to);
}

//Updates and sorts the objects
DynamicElementList.prototype.displayObjects = function(obj, from, to)
{
	this.updateObjects(obj, from, to);
	this.list.sort(this.functions.distance);
}

//Update the list of objects
DynamicElementList.prototype.updateObjects = function(obj, from, to)
{
	var filter = this.functions.within(from, to, this.list);
	
	this.removeDeletedObjects(obj, filter.relevant);
	this.addNewObjects(obj, filter.relevant);
}

//Remove any objects that were deleted
DynamicElementList.prototype.removeDeletedObjects = function(newobjs, oldobjs)
{
	a: for (var i = 0; i < oldobjs.length; i++)
	{
		for (var j = 0; j < newobjs.length; j++)
			if (this.functions.equals(oldobjs[i], newobjs[j]))
				continue a;
		
		if (oldobjs[i].element)
			this.functions.remove(oldobjs[i]);
		this.list.splice(this.list.indexOf(oldobjs[i]), 1);
		oldobjs.splice(i--, 1);
	}
}

//Add any new objects
DynamicElementList.prototype.addNewObjects = function(newobjs, oldobjs)
{
	a: for (var i = 0; i < newobjs.length; i++)
	{
		for (var j = 0; j < oldobjs.length; j++)
		{
			if (this.functions.equals(newobjs[i], oldobjs[j]))
			{
				this.functions.update(newobjs[i], oldobjs[j]);
				continue a;
			}
		}
		
		var newobj = this.functions.create(newobjs[i]);
		
		this.findClosestObject(newobj);
		this.list.push(newobj);
	}
}

//Find the closest object to the newly created object
DynamicElementList.prototype.findClosestObject = function(obj)
{
	var prevobj = this.element;
	var prevdist = Infinity;
	for (var x = 0; x < this.list.length; x++)
	{
		if (!!this.list[x].element)
		{
			var dist = this.functions.distance(this.list[x], obj);
			if (this.functions.equals(this.list[x], obj))
			{
				console.log("WARNING: Two elements turned out equal!"); //TODO
				return;
			} else if (Math.abs(dist) < Math.abs(prevdist))
			{
				prevobj = this.list[x].element;
				prevdist = dist;
			}
		}
	}
	this.addObject(obj, prevdist, prevobj);
}

//Adds the object to the DOM and returns the newly created element
DynamicElementList.prototype.addObject = function(obj, distance, closestElement)
{
	if (distance == Infinity)
		this.functions.addFE(obj.element);
	else if (distance < 0)
		closestElement.after(obj.element);
	else if (distance > 0)
		closestElement.before(obj.element);
	
	if (!winfocus)
		this.functions.show(obj);
	else
		this.functions.quickShow(obj);
	
	return obj.element;
}