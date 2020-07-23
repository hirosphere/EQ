const fs = require( "fs" );
const path = require( "path" );

this.oper1 = () =>
{
	const start = new Date().getTime();

	//test();
	update();

	console.log( ( new Date().getTime() - start ) / 1000 + "秒" );
};

const update = () =>
{
	const w = { ser: 0, change: 0, out: [] };
	dir_update( __dirname, "", w );
	w.out.push( "" );
	w.out.push( [ "フォルダ数  " + w.ser, "変更数  " + w.change ].join( "\t" ) );
	fs.writeFileSync( path.join( __dirname, "ListUpdate.txt" ), w.out.join( "\n" ) );
};

const test = () =>
{
	const dirpath = path.join( __dirname, "TestFolder" );
	const stat = fs.statSync( dirpath );
	console.log( dirpath, df( new Date( stat.mtime ) ) );
};

const df = ( d ) => `${ d.getFullYear() }/${ d.getMonth() * 1 }/${ d.getDate() } ${ d.getHours() }:${ d.getMinutes() } (${ d.getSeconds() })`; 

const dir_update = ( dirpath, nest, w ) =>
{
	const ser = w.ser ++;
	const stat = fs.statSync( dirpath );
	
	// 新規リストを作成しつつ、旧リストと照合し変更検知。 //
	
	const listpath = path.join( dirpath, "Index.txt" );
	const oldlist = list_read( listpath );
	const newlist = [];

	let is_changed = oldlist == null;
	const itemkeys = {};

	//. アイテム追加検知 //

	for( const item of fs.readdirSync( dirpath ) )
	{
		itemkeys[ item ] = true;

		const itempath = path.join( dirpath, item );
		const stat = fs.statSync( itempath );

		const mtime = stat.mtime.toISOString();
		const olditem = oldlist && oldlist[ item ];

		if( stat.isDirectory() )
		{
			if( olditem == null || olditem.mtime != mtime ) is_changed = true;
			newlist.push( [ "Dir", item, mtime ].join( "\t") );
			dir_update( itempath, nest + "--- ", w );
		}

		else if( is_data_file( stat, item ) )
		{
			if( olditem == null ) is_changed = true;
			newlist.push( [ "File", item ].join( "\t") );
		}

		//w.out.push( [ item, oldlist[ item ] != null, is_changed ].join( "\t" ) );
	}

	//. アイテム削除検知 //

	if( oldlist ) for( const oldkey in oldlist ) if( itemkeys[ oldkey ] == undefined ) is_changed = true;
	
	// 結果処理 //
	
	w.out.push( [ ser, path.basename( dirpath ), ( is_changed ? "変更あり" : "変更なし" ), stat.mtime.toISOString() ].join( "\t" ) );
	
	if( is_changed )
	{
		fs.writeFileSync( listpath, newlist.join( "\n" ) );
		console.log( "変更あり", dirpath );
		w.change ++;
	}
};

const is_data_file = ( stat, file ) => stat.isFile() && path.extname( file ).match( /\.kwin/ );

const list_read = ( path ) =>
{
	const rt = {};
	try
	{
		for( const line of fs.readFileSync( path, "utf-8" ).split( "\n" ) )
		{
			const vs = line.split( "\t" );
			const name = vs[ 1 ];
			rt[ name ] = { type: vs[ 0 ], mtime: vs[ 2 ] };
		}
	}
	catch( err ){ return null; }
	return rt;
} 
