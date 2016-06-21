if( NOT BUILD_USE_PCL OR NOT PCL_FOUND )
  return()
endif()

add_executable(pcd_write_test pcd_write.cpp)
target_link_libraries(pcd_write_test ${PCL_COMMON_LIBRARIES} ${PCL_IO_LIBRARIES})
