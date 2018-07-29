package com.example.service;


import java.util.List;

import com.example.dto.AddressDto;
import com.example.dto.GeocoderDto;
import com.example.dto.PlaceDto;
import com.example.dto.PlaceResult;
import com.example.vo.AddressVo;

public interface AddressService {
	
	/**
	 * 获取地址的经纬度信息
	 * @param address
	 * @return
	 */
	AddressDto getLocation(String address);
	
	/**
	 * 调用百度地图检索地址
	 * @param address 检索关键字
	 * @param pageNum 返回页数
	 * @param city	  检索城市
	 * @return
	 */
	String getPlace(String address,Integer pageNum,String city) throws Exception;
	
	/**
	 * 根据百度地图api获取地点的完整地址
	 * @param placeResult
	 */
	void getCompleteAddress(PlaceResult placeResult);
	
	/**
	 * 根据百度地图api获取地点的完整地址
	 * @param lat
	 * @param lng
	 */
	GeocoderDto getCompleteAddressByLocation(Double lat,Double lng);
	
	/**
	 * 获取名称相近的地址
	 * @param address
	 * @return
	 */
	List<String> getSimilarAddress(String address);
	
	/**
	 * 获取某经纬度特定范围内的地址
	 * @param lat
	 * @param lng
	 * @param range
	 * @return
	 */
	List<AddressVo> getRangeAddress(Double lat,Double lng,Double range);
}
