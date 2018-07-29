package com.example.service.impl;

import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.alibaba.fastjson.JSONObject;
import com.example.dto.AddressDto;
import com.example.dto.GeocoderDto;
import com.example.dto.PlaceResult;
import com.example.service.AddressService;
import com.example.util.FileUtil;
import com.example.util.HttpUtil;
import com.example.vo.AddressVo;

@Service
public class AddressServiceImpl implements AddressService{

	@Value("${address.ak}")
	private String ak;
	@Value("${address.manageUrl}")
	private String manageUrl;
	
	private static double rad(double d) { 
        return d * Math.PI / 180.0; 
    }
	
	@Override
	public AddressDto getLocation(String address) {
		String url = "http://api.map.baidu.com/geocoder/v2/";
		String param = "address=" + address + "&output=json&ak=" + ak;
		String json = HttpUtil.sendGet(url, param);
		AddressDto addressDto = JSONObject.parseObject(json, AddressDto.class);
		return addressDto;
	}

	@Override
	public String getPlace(String address,Integer pageNum,String city) throws Exception{
		String json = null;
		String url = "http://api.map.baidu.com/place/v2/search";
		String param = "query=" + address + "&region=" + city + "&output=json&ak=" + ak + "&page_num=" + pageNum;
		json = HttpUtil.sendGet(url, param);
		return json;
	}

	@Override
	public void getCompleteAddress(PlaceResult placeResult) {
		String url = "http://api.map.baidu.com/geocoder/v2/";
		String param = "location=" + placeResult.getLocation().getLat() + "," + 
				placeResult.getLocation().getLng() + "&output=json&extensions_town=true&ak=" + ak;
		String json = HttpUtil.sendGet(url, param);
		GeocoderDto geocoderDto = JSONObject.parseObject(json, GeocoderDto.class);
		if (geocoderDto.getStatus()==0) {
			placeResult.setName(geocoderDto.getResult().getAddressComponent().getCity() + geocoderDto.getResult().getAddressComponent().getDistrict() + 
					geocoderDto.getResult().getAddressComponent().getTown() + geocoderDto.getResult().getAddressComponent().getStreet() + 
					placeResult.getName());
		}
	}

	@Override
	public GeocoderDto getCompleteAddressByLocation(Double lat, Double lng) {
		// TODO Auto-generated method stub
		String url = "http://api.map.baidu.com/geocoder/v2/";
		String param = "location=" + lat + "," + lng + "&output=json&extensions_town=true&ak=" + ak;
		String json = HttpUtil.sendGet(url, param);
		GeocoderDto geocoderDto = JSONObject.parseObject(json, GeocoderDto.class);
		return geocoderDto;
	}
	
	@Override
	public List<String> getSimilarAddress(String address) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<AddressVo> getRangeAddress(Double lat, Double lng, Double range) {
		List<String> list = FileUtil.readTxtFile(manageUrl);
		List<AddressVo> addressVos = new ArrayList<AddressVo>();
		for(String json : list){
			AddressVo addressVo = JSONObject.parseObject(json, AddressVo.class);
			double difference  = rad(lat) - rad(addressVo.getLat());
			double mdifference = rad(lng) - rad(addressVo.getLng());
			double distance = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(difference / 2), 2)
		                + Math.cos(rad(lat)) * Math.cos(rad(addressVo.getLat()))
		                * Math.pow(Math.sin(mdifference / 2), 2)));
			distance = distance * 6378.137;
		    distance = Math.round(distance * 10000) / 10000;
		    if (distance<range) {
		    	System.out.println(json);
				addressVos.add(addressVo);
			}
		}
		// TODO Auto-generated method stub
		return addressVos;
	}

}
