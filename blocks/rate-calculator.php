<?php
/**
 * Rate Calculator
 *
 * @package nbu
 */

include "../functions/get-field-as-element.php";

$calculator_title            = get_field( 'calculator_title' );
$calculator_explanation_text = get_field( 'calculator_explanation_text' );
$persistent_footnote_text    = get_field( 'persistent_footnote_text' );
$step_three_disclaimer_text  = get_field( 'step_three_disclaimer_text' );
$irrigation_question_text    = get_field( 'irrigation_question_text' );

$off_peak_label    = 'Off Peak – October through May';
$off_peak_override = get_field( 'off-peak_label' );

if ( $off_peak_override ) {
	$off_peak_label = $off_peak_override;
}

$peak_label    = 'Peak – June through September';
$peak_override = get_field( 'peak_label' );

if ( $peak_override ) {
	$peak_label = $peak_override;
}

$include_electric = get_field( 'include_electric' );
if ( $include_electric ) {
	$monthly_power_usage_label            = get_field( 'monthly_power_usage_label' );
	$monthly_power_usage_placeholder_text = get_field( 'monthly_power_usage_placeholder_text' );
	$monthly_power_usage_supporting_text  = get_field( 'monthly_power_usage_supporting_text' );
	$off_peak_power_rate                  = get_field_as_element( 'off_peak_power_rate' );
	$peak_power_rate                      = get_field_as_element( 'peak_power_rate' );
	$power_recovery_cost                  = get_field_as_element( 'power_recovery_cost' );
	$power_delivery_charge                = get_field_as_element( 'power_delivery_charge' );
	$electric_availability_charge         = get_field_as_element( 'electric_availability_charge' );
}

$include_wastewater = get_field( 'include_wastewater' );
if ( $include_wastewater ) {
	$wastewater_usage_label            = get_field( 'wastewater_usage_label' );
	$wastewater_usage_placeholder_text = get_field( 'wastewater_usage_placeholder_text' );
	$wastewater_usage_supporting_text  = get_field( 'wastewater_usage_supporting_text' );
	$wastewater_availability_charge    = get_field_as_element( 'wastewater_availability_charge' );
	$wastewater_cost_per_gallon        = get_field_as_element( 'wastewater_cost_per_gallon' );
	$maximum_total_wastewater_charge   = get_field_as_element( 'maximum_total_wastewater_charge' );
	$non_nbu_water_service_fee         = get_field_as_element( 'non_nbu_water_service_fee' );
}

$include_water = get_field( 'include_water' );
if ( $include_water ) {
	$tier_one_off_peak_residential_water_rate   = get_field_as_element( 'tier_one_off_peak_residential_water_rate' );
	$tier_one_peak_residential_water_rate       = get_field_as_element( 'tier_one_peak_residential_water_rate' );
	$tier_two_off_peak_residential_water_rate   = get_field_as_element( 'tier_two_off_peak_residential_water_rate' );
	$tier_two_peak_residential_water_rate       = get_field_as_element( 'tier_two_peak_residential_water_rate' );
	$tier_three_off_peak_residential_water_rate = get_field_as_element( 'tier_three_off_peak_residential_water_rate' );
	$tier_three_peak_residential_water_rate     = get_field_as_element( 'tier_three_peak_residential_water_rate' );
	$tier_four_off_peak_residential_water_rate  = get_field_as_element( 'tier_four_off_peak_residential_water_rate' );
	$tier_four_peak_residential_water_rate      = get_field_as_element( 'tier_four_peak_residential_water_rate' );

	$tier_one_off_peak_irrigation_water_rate   = get_field_as_element( 'tier_one_off_peak_irrigation_water_rate' );
	$tier_one_peak_irrigation_water_rate       = get_field_as_element( 'tier_one_peak_irrigation_water_rate' );
	$tier_two_off_peak_irrigation_water_rate   = get_field_as_element( 'tier_two_off_peak_irrigation_water_rate' );
	$tier_two_peak_irrigation_water_rate       = get_field_as_element( 'tier_two_peak_irrigation_water_rate' );
	$tier_three_off_peak_irrigation_water_rate = get_field_as_element( 'tier_three_off_peak_irrigation_water_rate' );
	$tier_three_peak_irrigation_water_rate     = get_field_as_element( 'tier_three_peak_irrigation_water_rate' );

	$water_supply_fee_rate    = get_field_as_element( 'water_supply_fee_rate' );
	$stage_three_drought_rate = get_field_as_element( 'stage_three_drought_rate' );
	$stage_four_drought_rate  = get_field_as_element( 'stage_four_drought_rate' );

	$residential_water_meter_size_label      = get_field( 'residential_water_meter_size_label' );
	$irrigation_water_meter_size_label       = get_field( 'irrigation_water_meter_size_label' );
	$water_meter_sizes_supporting_text       = get_field( 'water_meter_sizes_supporting_text' );
	$home_use_water_volume_label             = get_field( 'home_use_water_volume_label' );
	$irrigation_water_volume_label           = get_field( 'irrigation_water_volume_label' );
	$home_use_water_volume_supporting_text   = get_field( 'home_use_water_volume_supporting_text' );
	$irrigation_water_volume_supporting_text = get_field( 'irrigation_water_volume_supporting_text' );
	$drought_stage_link                      = get_field( 'drought_stage_link' );
}
?>

<section class="rate-calculator">
	<?php if ( $calculator_title ) : ?>
		<h3 class="rate-calculator__title"><?php echo esc_html( $calculator_title ); ?></h3>
	<?php endif ?>
	<div class="rate-calculator__top">
		<div class="rate-calculator__top--hide" id="js-rc-season-text"></div>
		<div class="rate-calculator__top--hide" id="js-rc-service-text"></div>
	</div>
	<form class="rate-calculator__wrapper">
		<div class="service__steps steps js-active js-rc-preloader" aria-hidden="true">
			<div class="service__step step step--ghost">
				<div class="step__index"></div>
			</div>
			<div class="service__step step step--ghost">
				<div class="step__index"></div>
			</div>
			<div class="service__step step step--ghost">
				<div class="step__index"></div>
			</div>
		</div>
		<div class="rate-calculator__panel">
			<?php if ( $calculator_explanation_text ) : ?>
				<div class="wysiwyg"><?php echo wp_kses_post( $calculator_explanation_text ); ?></div>
			<?php endif ?>
			<div class="rate-calculator__fields">
				<div class="rate-calculator__field">
					<div class="form-group">
						<label for="rc-service-selector">Service Type</label>
						<select id="rc-service-selector" required>
							<option disabled selected value="">Choose Service Type</option>
							<?php if ( $include_water && $include_wastewater && $include_electric ) : ?>
								<option value="water-wastewater-electric">Water, Wastewater &amp; Electric</option>
							<?php endif ?>
							<?php if ( $include_water && $include_wastewater ) : ?>
								<option value="water-wastewater">Water &amp; Wastewater</option>
							<?php endif ?>
							<?php if ( $include_water && $include_electric ) : ?>
								<option value="water-electric">Water &amp; Electric</option>
							<?php endif ?>
							<?php if ( $include_electric && $include_wastewater ) : ?>
								<!-- <option value="wastewater-electric">Wastewater &amp; Electric</option> -->
							<?php endif ?>
							<?php if ( $include_water ) : ?>
								<option value="water-only">Water Only</option>
							<?php endif ?>
							<?php if ( $include_wastewater ) : ?>
								<option value="wastewater-only">Wastewater Only</option>
							<?php endif ?>
							<?php if ( $include_electric ) : ?>
								<option value="electric-only">Electric Only</option>
							<?php endif ?>
						</select>
					</div>
				</div>
				<div class="rate-calculator__field">
					<div class="form-group">
						<label for="rates-seasons">Season</label>
						<select id="rates-seasons" required>
							<option disabled selected value="">Choose a Season</option>
							<option value="off-peak-october-through-may"><?php echo esc_html( $off_peak_label ); ?></option>
							<option value="peak-june-through-september"><?php echo esc_html( $peak_label ); ?></option>
						</select>
					</div>
				</div>
			</div>
			<div class="rate-calculator__button">
				<button class="btn btn--yellow btn--3d js-rc-btn-next" type="button">Proceed</button>
			</div>
		</div>
		<div class="rate-calculator__panel">
			<div class="rate-calculator__services">
				<?php if ( $include_electric ) : ?>
					<div class="rate-calculator__service electricity">
						<div class="electric-values">
							<?php echo wp_kses_post( $off_peak_power_rate ); ?>
							<?php echo wp_kses_post( $peak_power_rate ); ?>
							<?php echo wp_kses_post( $power_recovery_cost ); ?>
							<?php echo wp_kses_post( $power_delivery_charge ); ?>
							<?php echo wp_kses_post( $electric_availability_charge ); ?>
						</div>
						<div class="service-callout">
							<i class="callout-icon__icon callout-icon__icon--orange icon icon-electric"></i>
							<div class="title">Electricity</div>
						</div>
						<div class="service-details">
							<?php if ( $monthly_power_usage_label ) : ?>
								<label for="monthly-power-usage"><?php echo esc_html( $monthly_power_usage_label ); ?></label>
							<?php endif ?>
							<input id="monthly-power-usage" type="text" aria-describedby="monthly_power_usage_supporting_text" autocomplete="off" placeholder="<?php echo esc_html( $monthly_power_usage_placeholder_text ); ?>" maxlength="8" required>
							<?php if ( $monthly_power_usage_supporting_text ) : ?>
								<div id="monthly_power_usage_supporting_text"><?php echo wp_kses_post( $monthly_power_usage_supporting_text ); ?></div>
							<?php endif ?>
						</div>
					</div>
				<?php endif ?>
				<?php if ( $include_wastewater ) : ?>
					<div class="rate-calculator__service wastewater">
						<div class="wastewater-values">
							<?php echo wp_kses_post( $wastewater_availability_charge ); ?>
							<?php echo wp_kses_post( $wastewater_cost_per_gallon ); ?>
							<?php echo wp_kses_post( $maximum_total_wastewater_charge ); ?>
							<?php echo wp_kses_post( $non_nbu_water_service_fee ); ?>
						</div>
						<div class="service-callout">
							<i class="callout-icon__icon callout-icon__icon--green icon icon-waste-water"></i>
							<div class="title">Wastewater</div>
						</div>
						<div class="service-details">
							<?php if ( $wastewater_usage_label ) : ?>
								<label for="wastewater-usage"><?php echo esc_html( $wastewater_usage_label ); ?></label>
							<?php endif ?>
							<input id="wastewater-usage" type="text" aria-describedby="wastewater_usage_supporting_text" autocomplete="off" placeholder="<?php echo esc_html( $wastewater_usage_placeholder_text ); ?>" maxlength="8" required>
							<?php if ( $wastewater_usage_supporting_text ) : ?>
								<div id="wastewater_usage_supporting_text"><?php echo wp_kses_post( $wastewater_usage_supporting_text ); ?></div>
							<?php endif ?>
						</div>
					</div>
				<?php endif ?>
				<?php if ( $include_water ) : ?>
					<div class="rate-calculator__service water-home-use">
						<div class="water-values">
							<?php echo wp_kses_post( $tier_one_off_peak_residential_water_rate ); ?>
							<?php echo wp_kses_post( $tier_one_peak_residential_water_rate ); ?>
							<?php echo wp_kses_post( $tier_two_off_peak_residential_water_rate ); ?>
							<?php echo wp_kses_post( $tier_two_peak_residential_water_rate ); ?>
							<?php echo wp_kses_post( $tier_three_off_peak_residential_water_rate ); ?>
							<?php echo wp_kses_post( $tier_three_peak_residential_water_rate ); ?>
							<?php echo wp_kses_post( $tier_four_off_peak_residential_water_rate ); ?>
							<?php echo wp_kses_post( $tier_four_peak_residential_water_rate ); ?>
							<?php echo wp_kses_post( $tier_one_off_peak_irrigation_water_rate ); ?>
							<?php echo wp_kses_post( $tier_one_peak_irrigation_water_rate ); ?>
							<?php echo wp_kses_post( $tier_two_off_peak_irrigation_water_rate ); ?>
							<?php echo wp_kses_post( $tier_two_peak_irrigation_water_rate ); ?>
							<?php echo wp_kses_post( $tier_three_off_peak_irrigation_water_rate ); ?>
							<?php echo wp_kses_post( $tier_three_peak_irrigation_water_rate ); ?>
							<?php echo wp_kses_post( $water_supply_fee_rate ); ?>
							<?php echo wp_kses_post( $stage_three_drought_rate ); ?>
							<?php echo wp_kses_post( $stage_four_drought_rate ); ?>
						</div>
						<div class="service-callout">
							<i class="callout-icon__icon callout-icon__icon--whu-blue icon icon-water-1"></i>
							<div class="title">Water – Home Use</div>
						</div>
						<div class="service-details">
							<?php if ( have_rows( 'water_meter_sizes' ) ) : ?>
								<?php if ( $residential_water_meter_size_label ) : ?>
									<label for="meter-size-water-home-use"><?php echo esc_html( $residential_water_meter_size_label ); ?></label>
								<?php endif ?>
								<select id="meter-size-water-home-use" class="form-control" required aria-describedby="water_meter_sizes_supporting_text">
									<?php
									while ( have_rows( 'water_meter_sizes' ) ) :
										the_row();
										$text            = get_sub_field( 'meter_size_label' );
										$value           = get_sub_field( 'meter_size_residential_charge' );
										$selected_string = '';

										if ( '5/8 inch' === $text ) {
											$selected_string = 'selected';
										}
										?>
										<option value="<?php echo esc_html( $value ); ?>" <?php echo esc_html( $selected_string ); ?>><?php echo esc_html( $text ); ?></option>
									<?php endwhile; ?>
								</select>
								<?php if ( $water_meter_sizes_supporting_text ) : ?>
									<div id="water_meter_sizes_supporting_text"><?php echo wp_kses_post( $water_meter_sizes_supporting_text ); ?></div>
								<?php endif ?>
							<?php endif; ?>
							<?php if ( $home_use_water_volume_label ) : ?>
								<label for="monthly-water-volume-water-home-use"><?php echo esc_html( $home_use_water_volume_label ); ?></label>
							<?php endif ?>
							<input id="monthly-water-volume-water-home-use" aria-describedby="home_use_water_volume_supporting_text" type="text" class="form-control" autocomplete="off" placeholder="Estimated Monthly Use (Gallons)" maxlength="8" required>
							<?php if ( $home_use_water_volume_supporting_text ) : ?>
								<div id="home_use_water_volume_supporting_text"><?php echo wp_kses_post( $home_use_water_volume_supporting_text ); ?></div>
							<?php endif ?>
							<label for="drought-stage">Drought Stage</label>
							<select id="drought-stage" required>
								<option>Stage 1</option>
								<option>Stage 2</option>
								<option>Stage 3</option>
								<option>Stage 4</option>
								<option selected>Non-Drought</option>
							</select>
							<?php if ( $drought_stage_link ) : ?>
								<?php
								$drought_target_string = '';

								if ( $drought_stage_link['target'] ) {
									$drought_target_string = 'target="' . $drought_stage_link['target'] . '"';
								}
								?>
								<div>
									<p><a href="<?php echo esc_url( $drought_stage_link['url'] ); ?>" <?php echo wp_kses_post( $drought_target_string ); ?>><?php echo esc_html( $drought_stage_link['title'] ); ?></a></p>
								</div>
							<?php endif ?>
							<fieldset id="has-irrigation">
								<?php if ( $irrigation_question_text ) : ?>
									<legend><?php echo esc_html( $irrigation_question_text ); ?></legend>
								<?php else : ?>
									<legend>Do you have irrigation?</legend>
								<?php endif ?>
								<label>Yes
									<input id="yes-irrigation" type="radio" name="customer-irrigation" value="yes">
								</label>
								<label>No
									<input type="radio" name="customer-irrigation" value="no">
								</label>
							</fieldset>
						</div>
					</div>
					<div class="rate-calculator__service water-irrigation">
						<div class="service-callout">
							<i class="callout-icon__icon callout-icon__icon--wi-blue icon icon-irrigation"></i>
							<div class="title">Water – Irrigation</div>
						</div>
						<div class="service-details">
							<?php if ( have_rows( 'water_meter_sizes' ) ) : ?>
								<?php if ( $irrigation_water_meter_size_label ) : ?>
									<label for="meter-size-water-irrigation"><?php echo esc_html( $irrigation_water_meter_size_label ); ?></label>
								<?php endif ?>
								<select id="meter-size-water-irrigation" class="form-control" aria-describedby="irrigation_water_meter_sizes_supporting_text" required>
									<?php
									while ( have_rows( 'water_meter_sizes' ) ) :
										the_row();
										$text            = get_sub_field( 'meter_size_label' );
										$value           = get_sub_field( 'meter_size_irrigation_charge' );
										$selected_string = '';
										if ( '5/8 inch' === $text ) {
											$selected_string = 'selected';
										}
										?>
										<option value="<?php echo esc_html( $value ); ?>" <?php echo esc_html( $selected_string ); ?>><?php echo esc_html( $text ); ?></option>
									<?php endwhile; ?>
								</select>
								<?php if ( $water_meter_sizes_supporting_text ) : ?>
									<div id="irrigation_water_meter_sizes_supporting_text"><?php echo wp_kses_post( $water_meter_sizes_supporting_text ); ?></div>
								<?php endif ?>
							<?php endif; ?>
							<?php if ( $irrigation_water_volume_label ) : ?>
								<label for="monthly-water-volume-irrigation"><?php echo esc_html( $irrigation_water_volume_label ); ?></label>
							<?php endif; ?>
							<input id="monthly-water-volume-irrigation" type="text" aria-describedby="irrigation_water_volume_supporting_text" class="form-control" autocomplete="off" placeholder="Estimated Monthly Use (Gallons)" maxlength="8" required>
							<?php if ( $irrigation_water_volume_supporting_text ) : ?>
								<div id="irrigation_water_volume_supporting_text"><?php echo wp_kses_post( $irrigation_water_volume_supporting_text ); ?></div>
							<?php endif ?>
						</div>
					</div>
				<?php endif ?>
			</div>
			<div class="rate-calculator__button">
				<button class="btn btn--yellow btn--3d js-rc-btn-next" type="button">Estimate Bills</button>
			</div>
		</div>
		<div class="rate-calculator__panel">
			<div class="rate-calculator__results"></div>
			<div class="rate-calculator__button">
				<button class="btn btn--yellow btn--3d js-rc-btn-restart" type="button">Start Over</button>
			</div>
			<div class="rate-calculator__panel__notes">
				<?php if ( $step_three_disclaimer_text ) : ?>
					<div class="wysiwyg"><?php echo wp_kses_post( $step_three_disclaimer_text ); ?></div>
				<?php endif ?>
			</div>
		</div>
	</form>
	<?php if ( $persistent_footnote_text ) : ?>
		<div class="rate-calculator__footnote"><?php echo wp_kses_post( $persistent_footnote_text ); ?></div>
	<?php endif ?>
	<div class="rate-calculator__button back-parent-hide">
		<button class="btn btn--yellow btn--3d js-rc-btn-back" type="button">Back</button>
	</div>
</section>
