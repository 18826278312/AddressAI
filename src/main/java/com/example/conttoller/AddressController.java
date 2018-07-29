package com.example.conttoller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import com.alibaba.fastjson.JSONObject;
import com.example.dto.AddressDto;
import com.example.dto.GeocoderDto;
import com.example.dto.PlaceDto;
import com.example.service.AddressService;
import com.example.util.FileUtil;
import com.example.vo.AddressVo;

@Controller
@RequestMapping("/AddressController")
public class AddressController {

	@Resource
	private AddressService addressService;
	@Value("${address.manageUrl}")
	private String manageUrl;
	@Value("${address.blindUrl}")
	private String blindUrl;
	@Value("${small.range}")
	private Double smallRange;
	@Value("${big.range}")
	private Double bigRange;
	
	@RequestMapping(value="/address")
	public String address(){
		System.out.println("address");
		return "address";
	}
	
	@RequestMapping(value="getArea")
	@ResponseBody
	public Map<String,Object> getArea(){
		Map<String,Object> map = new HashMap<String,Object>();
		try {
			List<AddressVo> manageList = new ArrayList<AddressVo>();
			List<AddressVo> blindList = new ArrayList<AddressVo>();
			for(String address : FileUtil.readTxtFile(manageUrl)){
				manageList.add(JSONObject.parseObject(address, AddressVo.class));
			}
			for(String address : FileUtil.readTxtFile(blindUrl)){
				blindList.add(JSONObject.parseObject(address, AddressVo.class));
			}
			map.put("status", 0);
			map.put("manageList", manageList);
			map.put("blindList", blindList);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			map.put("status", 5);
			map.put("info", "系统异常：" + e.toString());
		}
		return map;
	}
	/**
	 * 搜索地址
	 * @param address
	 * @param pageNum
	 * @return
	 */
	
	@RequestMapping(value="searchAddress")
	@ResponseBody
	public Map<String, Object> searchAddress(String address,Integer pageNum){
		System.out.println("searchAddress");
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			//检索地址
			String json = addressService.getPlace(address.replaceAll(" ", ""), pageNum, "汕头市");
			PlaceDto placeDto = JSONObject.parseObject(json, PlaceDto.class);
			if (placeDto.getStatus()==0) {
				//如果检索不到地址
				if (placeDto.getTotal()==0) {
					map.put("status", 1);
					map.put("info", "未找到相关地点。");
				}else{
					for(int i=0;i<placeDto.getResults().size();i++){
						addressService.getCompleteAddress(placeDto.getResults().get(i));
					}
					map.put("status", 0);
					map.put("place", placeDto);
				}
			}else{
				map.put("status", 2);
				map.put("info", "百度地图api调用异常：" + placeDto.getMessage());
			}
		} catch (Exception e) {
			map.put("status", 5);
			map.put("info", "系统异常：" + e.toString());
		}
		return map;
	}
	
	/**
	 * 获取管辖地址
	 * @param name
	 * @param lat
	 * @param lng
	 * @return
	 */
	@RequestMapping(value="getManageAddress")
	@ResponseBody
	public Map<String, Object> getManageAddress(String name,Double lat,Double lng){
		Map<String, Object> map = new HashMap<String,Object>();
		try {
			List<AddressVo> list = addressService.getRangeAddress(lat, lng, bigRange);
			map.put("status", 0);
			map.put("address",name);
			map.put("list", list);
		} catch (Exception e) {
			map.put("status", 5);
			map.put("info", "系统异常：" + e.toString());
		}
		return map;
	}
	
	/**
	 * 检验地址是否覆盖
	 * @param address
	 * @return
	 */
	@RequestMapping(value="checkAddress")
	@ResponseBody
	public Map<String, Object> checkAddress(String address){
		Map<String, Object> map = new HashMap<String,Object>();
		try {
			AddressDto addressDto = addressService.getLocation(address);
			List<AddressVo> list = addressService.getRangeAddress(addressDto.getResult().getLocation().getLat(), addressDto.getResult().getLocation().getLng(), smallRange);
			Double possibility = list.size()/10.0 > 1.0 ? 1.0 : list.size()/10.0;
			map.put("status", 0);
			map.put("address", addressDto);
			map.put("possibility", "地址“" + address + "”的宽带管线资源覆盖可能性为：" + (int)(possibility*100) + "%");
		} catch (Exception e) {
			map.put("status", 5);
			map.put("info", "系统异常：" + e.toString());
		}
		return map;
	} 
	
	/**
	 * 根据经纬度获取地址信息和管辖地址
	 * @param lat
	 * @param lng
	 * @return
	 */
	@RequestMapping(value="clickAddress")
	@ResponseBody
	public Map<String, Object> clickAddress(Double lat,Double lng){
		Map<String, Object> map = new HashMap<String,Object>();
		try {
			GeocoderDto geocoderDto = addressService.getCompleteAddressByLocation(lat, lng);
			String address = geocoderDto.getResult().getAddressComponent().getCity() + geocoderDto.getResult().getAddressComponent().getDistrict() + 
					geocoderDto.getResult().getAddressComponent().getTown() + geocoderDto.getResult().getAddressComponent().getStreet() + geocoderDto.getResult().getSematic_description();
			System.out.println(address);
			List<AddressVo> list = addressService.getRangeAddress(lat, lng, bigRange);
			map.put("status", 0);
			map.put("address",address);
			map.put("list", list);
		} catch (Exception e) {
			map.put("status", 5);
			map.put("info", "系统异常：" + e.toString());
		}
		return map;
	} 

}
