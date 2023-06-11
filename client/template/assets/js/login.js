$(document).ready(function() {
	$('#login-form').submit(function(event) {
	  event.preventDefault(); // Ngăn chặn form được gửi trực tiếp bằng cách reload trang web
  
	  var form_data = $(this).serialize(); // Lấy thông tin từ form và chuyển đổi thành chuỗi dạng URL-encoded
  
	  $.ajax({
		url: '/api/login',
		type: 'POST',
		data: form_data,
		success: function(response) {
		  // Xử lý phản hồi từ backend khi yêu cầu thành công
		  console.log(response);
		},
		error: function(xhr) {
		  // Xử lý phản hồi từ backend khi yêu cầu thất bại
		  console.log(xhr.responseText);
		}
	  });
	});
  });
  