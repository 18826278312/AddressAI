package com.example.vo;

public class AddressVo implements Comparable<AddressVo>{

	private Integer status;
	private Integer precise;
	private Integer confidence;
	private String level;
	private Double lat;
	private Double lng;
	private String name;
	private String address;
	private Double distance;
	public Integer getStatus() {
		return status;
	}
	public void setStatus(Integer status) {
		this.status = status;
	}
	public Integer getPrecise() {
		return precise;
	}
	public void setPrecise(Integer precise) {
		this.precise = precise;
	}
	public Integer getConfidence() {
		return confidence;
	}
	public void setConfidence(Integer confidence) {
		this.confidence = confidence;
	}
	public String getLevel() {
		return level;
	}
	public void setLevel(String level) {
		this.level = level;
	}
	public Double getLat() {
		return lat;
	}
	public void setLat(Double lat) {
		this.lat = lat;
	}
	public Double getLng() {
		return lng;
	}
	public void setLng(Double lng) {
		this.lng = lng;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public Double getDistance() {
		return distance;
	}
	public void setDistance(Double distance) {
		this.distance = distance;
	}
	
	@Override
	public int compareTo(AddressVo o) {
		// TODO Auto-generated method stub
		if(this.distance >= o.getDistance()){
			return 1;
		}
		return -1;
	}
	
}
