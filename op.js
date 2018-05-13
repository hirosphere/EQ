//	global  //
//	main  //
//  file system  //
//	util  //



//	global  //

var Shell = WScript.CreateObject("WScript.Shell");
var FSO = WScript.CreateObject( "Scripting.FileSystemObject" );
var args = WScript.Arguments;


//	main  //

function main()
{
	var cmd = args( 0 );
	var opt1 = ( args.length > 1 ? args(1) : "" );
	var start = new Date().getTime();

	var curdir = FSO.GetFolder( Shell.CurrentDirectory );
	switch( cmd )
	{
		case "UpdateList": eq_update_list( curdir, opt1 ); break;
	}

	var time = Math.ceil( ( new Date().getTime() - start ) / 1000 );
	alert( time + "秒で終了しました。 ");
}

function eq_update_list( folder, option )
{
	if( folder.name.match( /^[A-Z]+[0-9]+$/i ) )  return;
	
	var list = "";

	for( var iter = new Enumerator( folder.SubFolders ); ! iter.atEnd(); iter.moveNext() )
	{
		var item = iter.item();
		list += "Dir\t" + item.Name + "\t" + item.Size + "\r\n";
		eq_update_list( item, option );
	}

	for( var iter = new Enumerator( folder.Files ); ! iter.atEnd(); iter.moveNext() )
	{
		var item = iter.item();
		if( item.Name.match( /\.(kwin)$/ ) )
		{
			list += "File\t" + item.Name + "\t" + item.Size + "\r\n";
		}
	}

	var listpath = FSO.BuildPath( folder, "Index.txt" );
	if( option == "d" )
	{
		echo( listpath + " - リスト削除" );
		FSO.DeleteFile( listpath );
	}
	else
	{
		echo( folder.Path + " - リスト作成" );
		var ts = FSO.OpenTextFile( listpath, 2, true );
		ts.Write( list );
		ts.Close();
	}
}

//	util  //

function readv( file, failv )
{
	var json = read( file );
	if( json === undefined )  return failv;

	try { return eval( "(" + json + "\r\n)" ); }
	catch( exc ) { return failv; }
}

function read( filepath, failv )
{
	var rt = "";
	if( FSO.FileExists( filepath ) )
	{
		var f = FSO.OpenTextFile( filepath );
		return ( f && ! f.AtEndOfStream ) ? f.ReadAll() : "";
	}
	return failv;
}

function ts_read( ts )
{
	return ( ts && ! ts.AtEndOfStream ) ? ts.ReadAll() : "";
}

function exec( command, currdir )
{
	if( currdir ) Shell.CurrentDirectory = currdir;
	
	echo( command.join( "\r\n" ) + "\r\n" );
	//return;

	var res = Shell.Exec( command.join( " " ) );
	
	echo( "ExitCode : " + res.ExitCode );
	echo( "実行結果 :\r\n\r\n" + ts_read( res.StdOut ) );
}

function alert( msg )
{
	// var time = date_format( "{YYYY}年{M}月{D}日 {B}曜日 {h}時{m}分{s}秒" );
	var time = date_format( "{YYYY}-{MM}-{DD} {B} {hh}:{mm}:{ss}" );
	echo( " -- " + msg + " -- " + time );
}

function echo( msg )
{
	WScript.Echo( msg );
}

function quote( str )
{
	return "\"" + str + "\"";
}

function valueformat( value, vars )
{
	if( value != null )
	{
		if( value.constructor == String )  return  strformat( value, vars );
		if( value.constructor == Object || value.constructor == Array )
		{
			for( var i in value )  value[i] = valueformat( value[i], vars );
		}
	}
	return value;
}

function strformat( format, values )
{
	return ( "" + format ).replace
	(
		/\${([^}]+)}/g,
		function( all, name )
		{
			return values[ name ] + "";
		}
	);
}

String.prototype.sub_ = function( pos )
{
	return this.substr( ( pos < 0 ) ? this.length + pos : pos );
};

var date_format =
function df( format, date )
{
	date = date || new Date();
	var args = arguments;
	return ( "" + format ).replace( /{((`}|[^}])*)}+/g, fn );
	
	function fn( all, name )
	{
		var fn = df_fns[ name ];
		return fn ? fn( date ) : fsrch( name, args, 2, args.length, "" );
	}
};

var df_youbi = [ "日", "月", "火", "水", "木", "金", "土" ];

var df_fns = 
{
	YMD: function( date ) {  return df( "{YYYY}/{MM}/{DD}", date );  },
	YMDB: function( date ) {  return df( "{YYYY}/{MM}/{DD} ({B})", date );  },
	
	YYYY:  function( date )  {  return  "" + date.getFullYear();  },
	YY:  function( date )  {  return  ( "000" + date.getFullYear() ).sub_( -2 );  },
	MM:  function( date )  {  return  ( "0" + ( date.getMonth() + 1 ) ).sub_( -2 );  },
	M:  function( date )  {  return  "" + ( date.getMonth() + 1 );  },
	DD:  function( date )  {  return  ( "0" + date.getDate() ).sub_( -2 );  },
	D:  function( date )  {  return  "" + date.getDate();  },
	B: function( date )  {  return  df_youbi[  date.getDay()  ];  },
	
	hms: function( date )  {  return df( "{hh}:{mm}:{ss}", date );  },
	
	hh:  function( date )  {  return  ( "0" + date.getHours() ).sub_( -2 );  },
	h:  function( date )  {  return  "" + date.getHours();  },
	mm:  function( date )  {  return  ( "0" + date.getMinutes() ).sub_( -2 );  },
	m:  function( date )  {  return  "" + date.getMinutes();  },
	ss:  function( date )  {  return  ( "0" + date.getSeconds() ).sub_( -2 );  },
	s:  function( date )  {  return  "" + date.getSeconds();  },
	
	uYMD: function( date ) {  return df( "{uYYYY}/{uMM}/{uDD}", date );  },
	
	uYYYY:  function( date )  {  return  "" + date.getUTCFullYear();  },
	uYY:  function( date )  {  return  ( "000" + date.getUTCFullYear() ).sub_( -2 );  },
	uMM:  function( date )  {  return  ( "0" + ( date.getUTCMonth() + 1 ) ).sub_( -2 );  },
	uDD:  function( date )  {  return  ( "0" + date.getUTCDate() ).sub_( -2 );  }
};


//    //

main();
