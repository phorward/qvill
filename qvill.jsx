// Informal source: https://quilljs.com/guides/cloning-medium-with-parchment/

// Global imports
let Parchment = Quill.import("parchment");
let Container = Quill.import('blots/container');
let BlockEmbed = Quill.import('blots/block/embed');

// Default block
class Block extends Quill.import("blots/block")
{
	static create(value)
	{
		let node = super.create(value);
		node.setAttribute("class", "vitxt-paragraph");
		return node;
	}
}

Quill.register(Block, true);

// Bold
class BoldBlot extends Quill.import("formats/bold")
{
	static create(value)
	{
		let node = super.create(value);
		node.setAttribute("class", "vitxt-fBold");
		return node;
	}
}

BoldBlot.blotName = "bold";
BoldBlot.tagName = ["strong"];

Quill.register(BoldBlot, true);

// Italic
class ItalicBlot extends Quill.import("formats/italic")
{
	static create(value)
	{
		let node = super.create(value);
		node.setAttribute("class", "vitxt-fItalic");
		return node;
	}
}

ItalicBlot.blotName = "italic";
ItalicBlot.tagName = ["em"];

Quill.register(ItalicBlot, true);



// Super & Sub
class SuperSubBlot extends Quill.import("blots/inline")
{
	static create(value)
	{
		let node = super.create(value);
		node.setAttribute("class", "vitxt-f" + value);
		
		return node;
	}
	static formats(domNode) {
		return domNode.tagName.charAt(0).toUpperCase() +
		domNode.tagName.slice(1).toLowerCase();
	}
}

SuperSubBlot.tagName = ["sub", "sup"];
SuperSubBlot.blotName = "subsuper";

Quill.register(SuperSubBlot, true);

// Blockquote
class BlockquoteBlot extends Quill.import("formats/blockquote")
{
	static create(value)
	{
		let node = super.create(value);
		node.setAttribute("class", "vitxt-tQuote");
		return node;
	}
}

Quill.register(BlockquoteBlot, true);

// Header
class HeaderBlot extends Quill.import("formats/header")
{
	static create(value)
	{
		let cl = {
			1: "title",
			2: "large",
			3: "medium",
			4: "small",
		};

		let node = super.create(value);
		node.setAttribute("class", "vitxt-tHeading vitxt-tHeading-" + cl[value]);
		return node;
	}
}

HeaderBlot.blotName = "header";
HeaderBlot.tagName = ["h1", "h2", "h3", "h4"];
Quill.register(HeaderBlot, true);

// Align
let alignOptions = { scope: Parchment.Scope.BLOCK, whitelist: ["Left", "Right", "Center", "Justify"] };
let AlignClass = new Parchment.Attributor.Class("align", "vitxt-a", alignOptions);
Quill.register({"attributors/class/align": AlignClass,
	"formats/align": AlignClass}, true);


// List
class ListBlot extends Quill.import("formats/list")
{
	static create(value)
	{
		let node = super.create(value);
		if (value == "ordered")
		{
			node.setAttribute("class", "vitxt-list vitxt-listOrder");
		}
		else if (value == "bullet")
		{
			node.setAttribute("class", "vitxt-list vitxt-listUnorder");
		}

		return node;
	}
}

Quill.register(ListBlot, true);

// List Item
class ListItemBlot extends Quill.import("formats/list/item")
{
	static create(value)
	{
		let node = super.create(value);
		node.setAttribute("class", "vitxt-listItem");

		return node;
	}
}

Quill.register(ListItemBlot, true);


let indentAttributor = new Parchment.Attributor.Attribute('indent', 'data-indent', { 
	scope: Parchment.Scope.BLOCK
});
Quill.register(indentAttributor);

// Link
class LinkBlot extends Quill.import("formats/link")
{
	static create(value)  {
		console.log(value);

		let node = super.create(value.href);

		node.setAttribute('href', value.href);
		if (value.target) {
			node.setAttribute('target', value.target);
		} else {
			node.removeAttribute('target');
		}

		if (value.title) {
			node.setAttribute('title', value.title);
		} else {
			node.removeAttribute('title');
		}

		if (value.isDownload || (" " + node.className + " ").replace(/[\n\t]/g, " ").indexOf(" vitxt-download ") > -1 ) {
			node.setAttribute('class', "vitxt-download");
		} else {
			node.setAttribute('class', "vitxt-link");
		}
		return node;
	}

	static format(name, value)
	{
		if( !value )
			return;

		super.format(name, value.href); // use value.href here because the super class doesnt support objects

		this.domNode.setAttribute('href', value.href);
		if (value.target) {
			this.domNode.setAttribute('target', value.target);
		} else {
			this.domNode.removeAttribute('target');
		}

		if (value.title) {
			this.domNode.setAttribute('title', value.title);
		} else {
			this.domNode.removeAttribute('title');
		}
	}

	static formats(node)
	{
		return {
			href: node.getAttribute('href'),
			target: node.getAttribute('target'),
			title: node.getAttribute('title'),
		}
	}

}
LinkBlot.blotName = 'link';
LinkBlot.tagName = 'A';

Quill.register(LinkBlot, true);

// Image
class ImageBlot extends Quill.import('blots/embed') {
	static create(value)
	{
		console.log(value);
		let node = super.create();
		node.setAttribute('class', "vitxt-image");
		node.setAttribute('alt', value.alt);
		node.setAttribute('src', value.url);
		return node;
	}

	static value(node) {
		return {
			alt: node.getAttribute('alt'),
			url: node.getAttribute('src')
		};
	}
}
ImageBlot.blotName = 'image';
ImageBlot.tagName = 'img';

Quill.register(ImageBlot, true);

// Hr
class DividerBlot extends Quill.import('blots/embed') {
	static create(value)
	{
		let node = super.create();
		node.setAttribute('class', "vitxt-rule");
		return node;
	}
}
DividerBlot.blotName = 'divider';
DividerBlot.tagName = 'hr';
Quill.register(DividerBlot, true);

// Improved line breaking (from https://codepen.io/mackermedia/pen/gmNwZP)

var Delta = Quill.import('delta');
let Break = Quill.import('blots/break');
let Embed = Quill.import('blots/embed');

function lineBreakMatcher()
{
	var newDelta = new Delta();
	newDelta.insert({'break': ''});
	return newDelta;
}

function lineBreakHandler(range)
{
	let currentLeaf = this.quill.getLeaf(range.index)[0];
	let nextLeaf = this.quill.getLeaf(range.index + 1)[0];

	this.quill.insertEmbed(range.index, 'break', true, 'user');

	// Insert a second break if:
	// At the end of the editor, OR next leaf has a different parent (<p>)
	if (nextLeaf === null || (currentLeaf.parent !== nextLeaf.parent)) {
	  this.quill.insertEmbed(range.index, 'break', true, 'user');
	}

	// Now that we've inserted a line break, move the cursor forward
	this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
}

class SmartBreak extends Break {
  length () {
    return 1;
  }
  value () {
    return '\n';
  }

  insertInto(parent, ref) {
    Embed.prototype.insertInto.call(this, parent, ref);
  }
}

SmartBreak.blotName = 'break';
SmartBreak.tagName = 'BR';

Quill.register(SmartBreak);


// Tables (from https://github.com/GarrettGeorge/QuillTables/blob/master/quill.with.tables.js)

class ContainBlot extends Container {
  static create(value) {
    let tagName = 'contain';
    let node = super.create(tagName);
    return node;
  }

  insertBefore(blot, ref) {
    if (blot.statics.blotName == this.statics.blotName) {
      console.log('############################ Not sure this is clean:');
      console.log(blot);
      console.log(blot.children.head);
      super.insertBefore(blot.children.head, ref);
    } else {
      super.insertBefore(blot, ref);
    }
  }

  static formats(domNode) {
    return domNode.tagName;
  }

  formats() {
    // We don't inherit from FormatBlot
    return { [this.statics.blotName]: this.statics.formats(this.domNode) }
  }

  replace(target) {
    if (target.statics.blotName !== this.statics.blotName) {
      let item = Parchment.create(this.statics.defaultChild);
      target.moveChildren(item);
      this.appendChild(item);
    }
    if (target.parent == null) return;
    super.replace(target)
  }
}

ContainBlot.blotName = 'contain';
ContainBlot.tagName = 'contain';
ContainBlot.scope = Parchment.Scope.BLOCK_BLOT;
ContainBlot.defaultChild = 'block';
ContainBlot.allowedChildren = [Block, BlockEmbed, Container];
Quill.register(ContainBlot);

class TableRow extends Container {
  static create(value) {
    let tagName = 'tr';
    let node = super.create(tagName);
    return node;
  }

  optimize() {
    super.optimize();
    let parent = this.parent;
    if (parent != null && parent.statics.blotName != 'table') {
      this.processTable();
    }
  }

  processTable () {
    let currentBlot = this;
    let rows = [];
    while (currentBlot) {
      if (! (currentBlot instanceof TableRow)) {
        break
      }
      rows.push(currentBlot);
      currentBlot = currentBlot.next;
    }
    let mark = Parchment.create('block');
    this.parent.insertBefore(mark, this.next);
    let table = Parchment.create('table');
    rows.forEach(function (row) {
      table.appendChild(row);
    });
    table.replace(mark);
  }
}

TableRow.blotName = 'tr';
TableRow.tagName = 'tr';
TableRow.scope = Parchment.Scope.BLOCK_BLOT;
TableRow.defaultChild = 'td';
Quill.register(TableRow);

class Table extends Container {
  optimize() {
    super.optimize();
    let next = this.next;
    if (next != null && next.prev === this &&
        next.statics.blotName === this.statics.blotName &&
        next.domNode.tagName === this.domNode.tagName
        ) {
      next.moveChildren(this);
      next.remove();
    }
  }
}

Table.blotName = 'table';
Table.tagName = 'table';
Table.scope = Parchment.Scope.BLOCK_BLOT;
Table.defaultChild = 'tr';
Table.allowedChildren = [TableRow];
Quill.register(Table);

//
//
// CONTAINER TD
//

class TableCell extends ContainBlot {

  format() {
    return 'td'
  }

  optimize() {
    super.optimize();
    let parent = this.parent;
    if (parent != null && parent.statics.blotName != 'tr') {
      this.processTR()
    }
    // merge same TD id
    let next = this.next;
    if (next != null && next.prev === this &&
        next.statics.blotName === this.statics.blotName &&
        next.domNode.tagName === this.domNode.tagName
        ) {
      next.moveChildren(this);
      next.remove();
    }
  }
  processTR () {
    // find next row break
    let currentBlot = this;
    let rowItems = [this];
    while (currentBlot) {
      if (currentBlot.statics.tagName !== 'TD') {
        break;
      }
      rowItems.push(currentBlot);
      if (currentBlot instanceof RowBreak) {
        break;
      }
      currentBlot = currentBlot.next;
    }
    // create row, add row items as TDs
    let prevItem;
    let cellItems = [];
    let cells = [];
    rowItems.forEach(function (rowItem) {
      cellItems.push(rowItem);
      if (rowItem instanceof TableCell) {
        prevItem = rowItem;
      } else if (rowItem instanceof CellBreak) {
        cells.push(cellItems);
        cellItems = [];
      }
    });
    if (cellItems.length > 0) {
      cells.push(cellItems);
    }
    let mark = Parchment.create('block');
    this.parent.insertBefore(mark, this.next);
    // create row
    let row = Parchment.create('tr');
    cells.forEach(function (cell) {
    // add row elements
      cell.forEach(function (cellItem) {
        if(cellItem instanceof TableCell) {
          cellItem.domNode.classList.add("ql-td-" + cells.length);
        }
        row.appendChild(cellItem);
      });
    });
    row.replace(mark);
  }
}


TableCell.blotName = 'td';
TableCell.tagName = 'td';
TableCell.scope = Parchment.Scope.BLOCK_BLOT;
TableCell.defaultChild = 'block';
TableCell.allowedChildren = [Block, BlockEmbed, Container];
Quill.register(TableCell);

Quill.imports["tablecell"] = TableCell;


Container.order = [
  'list', 'contain',   // Must be lower
  'td', 'tr', 'table'  // Must be higher
];

class RowBreak extends BlockEmbed {
  formats() {
        return { trbr: true };
  }
}
RowBreak.blotName = 'trbr';
RowBreak.tagName = 'td';
RowBreak.className = 'trbr';

Quill.register(RowBreak);

class CellBreak extends BlockEmbed {
  formats() {
        return { tdbr: true };
  }
}
CellBreak.blotName = 'tdbr';
CellBreak.tagName = 'td';
CellBreak.className = 'tdbr';
Quill.register(CellBreak);

function getNextTDIndex(quill, contents, index) {
  var joinedText = contents.map(function(op) {
    return typeof op.insert === 'string' ? op.insert : ' '
  }).join('');

  /**
   * Breaking at first case of tdbr/trbr places the cursor
   * at the beginning of the table cell, but from a UX point
   * of view we want it to jump to the end. So we want the
   * text preceeding the second tdbr/trbr
   */
  var breakCount = 0;
  for(var i = 0; i < joinedText.length; i++) {
    var format = quill.getFormat(index + i);
    if(format.tdbr || format.trbr) {
      breakCount++;
    }
    if(breakCount === 2) {
      return index + i - 1;
    }
    if(!(format.tdbr || format.trbr || format.td)) {
      // Add row when in last table cell
      insertNewRow(
        {
          index: index,
          length: 0
        }
      );
      return index + i;
    }
  }
};

function getPreviousTDIndex(quill, contents, index) {
  var joinedText = contents.map(function(op) {
    return typeof op.insert === 'string' ? op.insert : ' '
  }).join('');
  for(var i = joinedText.length - 1; i >= 0; i--) {
    var format = quill.getFormat(i);
    if(format.tdbr || format.trbr) {
      // Go To previous table cell
      return i - 1;
    }
    if(!format.td) {
      // Go to front of table if shift+tab pressed in first cell
      return i + 1;
    }
  }
};

function getClosestNewLineIndex (quill, contents, index) {
  return index + contents.map(function(op) {
    return typeof op.insert === 'string' ? op.insert : ' '
  }).join('')
    .slice(index)
    .indexOf('\n')
}

function insertNewRow(quill, range) {
  let td = find_td(quill, 'td')
  if(td) {
    let columns = 0
    td.parent.children.forEach(function (child) {
      if (child instanceof TableCell) {
        columns++;
      }
    })

    // range.index + 1 is to avoid the current index having a \n
    const newLineIndex =  (quill, quill.getContents(), range.index + 1);
    let changeDelta = new Delta().retain(newLineIndex);
    for (let j = 0; j < columns; j++) {
      changeDelta = changeDelta.insert('\n', {
        td: true
      })
      if (j < columns - 1) {
        changeDelta = changeDelta.insert({ tdbr: true });
      }
    }
    changeDelta = changeDelta.insert({ trbr: true });
    quill.updateContents(changeDelta, Quill.sources.USER);
  }
}

function find_td(quill, what) {
    let leaf = quill.getLeaf(quill.getSelection()['index']);
    let blot = leaf[0];
    for(;blot!=null && blot.statics.blotName!=what;) {
      blot=blot.parent;
    }
    return blot; // return TD or NULL
}

