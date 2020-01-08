<!DOCTYPE html>
<html>
    <head>
        <title>chowa iconfont glyphs preview</title>
        <meta charset="utf-8"/>
        <style type="text/css">
        	* {
        		margin: 0;
        		padding: 0;
        		box-sizing: border-box;
        	}

        	html, body {
        		height: 100%;
        		background-color: #fff;
        	}

        	a {
        		text-decoration: none;
        	}

        	.container {
        		width: 980px;
        		margin: auto;
        	}

        	header {
        		padding: 22px 0;
        	}

        	header a img {
        		outline: none;
        		display: inline-block;
        		margin-right: 12px;
        	}

        	header a h1 {
        		display: inline-block;
        		color: #787878;
        		font-size: 28px;
        		line-height: 80px;
        		vertical-align: top;
        		font-weight: 400;
        	}

        	.logo {
        		width: 80px;
        		height: 80px;
        	}

        	.glyphs {
        		overflow: hidden;
        		width: 100%;
        		height: auto;
        		list-style: none;
        	}

        	.glyphs li {
        		width: 120px;
        		height: 148px;
        		float: left;
        		border: 1px solid #f5f5f5;
        		margin: 10px;
        		border-radius: 4px;
        		cursor: pointer;
        	}

        	.glyphs li:last-child,
        	.glyphs li:nth-child(10n) {
        		border-right: 1px solid #f5f5f5;
        	}

        	.glyphs li .icon {
        		height: 110px;
        		display: flex;
        		align-items: center;
        		justify-content: center;
        		color: #565656;
        		font-size: 28px;
        		transition: all .2s ease-in;
        	}

        	.glyphs li .name {
        		height: 38px;
        		line-height: 38px;
        		color: #787878;
        		text-align: center;
        		transition: all .2s ease-in;
        		cursor: copy;
                overflow: hidden;
                font-size: 12px;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding: 0 8px;
        	}

        	.glyphs li:hover {
        		background-color: #7774e7;
                border-color: #7774e7;
        	}

        	.glyphs li:hover .icon {
        		font-size: 42px;
        		color: #fff;
        	}

        	.glyphs li:hover .name {
        		color: #eee;
        	}

            {%styles%}
        </style>
    </head>

    <body>
    	<section class="container">
    		<header>
    			<a href="https://github.com/chowa/iconfont">
    				<img class="logo" src="http://upload.ouliu.net/i/202001081600304i7x6.png"/>
    				<h1>cwiconfont preview</h1>
    			</a>
    		</header>

    		<ul class="glyphs">
    			<!-- <li>
    				<div class="icon">
    					<i class="icon icon-test"></i>
    				</div>
    				<div class="name">test</div>
    			</li> -->
                {%icons%}
    		</ul>
    	</section>
    </body>
</html>
