<h3>Are you joking?{{ basename }}</h3>
<div class="page_lists">
	<div　class="row ">
		<div class="list-group">
    			{% for post in posts %}
    
      			 <a href="{{ post.url }}" class="list-group-item" target="_blank">
                            <div class="post-tags">
      				{% for tag in post.tags %}
					<span class="badge">{{ tag }}</span>
				{% endfor %}
                            </div>
      				<p class="post-title">{{ post.title }}</p>
                            <p class="post-date">发布时间:{{ post.date }}</p>
                     </a>
    			{% endfor%}
  		</div>
  	</div>
</div>
